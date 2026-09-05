import { Transaction, RecoveryAction, AuditLog } from '../models/index.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    // 1. Aggregated KPI Metrics
    const atRiskAgg = await Transaction.aggregate([
      {
        $match: {
          status: { $in: ['FAILED', 'OVERDUE', 'ABANDONED', 'PENDING_ANALYSIS', 'ESCALATED'] },
          recoveryStatus: { $ne: 'RECOVERED' },
        },
      },
      {
        $group: {
          _id: null,
          totalAtRisk: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const recoveredAgg = await Transaction.aggregate([
      {
        $match: {
          recoveryStatus: 'RECOVERED',
        },
      },
      {
        $group: {
          _id: null,
          totalRecovered: { $sum: '$amountRecovered' },
          count: { $sum: 1 },
        },
      },
    ]);

    const revenueAtRisk = atRiskAgg[0]?.totalAtRisk || 0;
    const atRiskCount = atRiskAgg[0]?.count || 0;
    const revenueRecovered = recoveredAgg[0]?.totalRecovered || 0;
    const recoveredCount = recoveredAgg[0]?.count || 0;

    const totalOpportunity = revenueRecovered + revenueAtRisk;
    const recoveryRate = totalOpportunity > 0 ? Number(((revenueRecovered / totalOpportunity) * 100).toFixed(1)) : 0;

    const actionsExecuted = await RecoveryAction.countDocuments({ status: { $in: ['EXECUTED', 'SUCCESS', 'FAILED'] } });

    // 2. Breakdown by Event Type
    const eventTypeStats = await Transaction.aggregate([
      {
        $group: {
          _id: '$eventType',
          totalCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          recoveredAmount: {
            $sum: {
              $cond: [{ $eq: ['$recoveryStatus', 'RECOVERED'] }, '$amountRecovered', 0],
            },
          },
          atRiskAmount: {
            $sum: {
              $cond: [{ $ne: ['$recoveryStatus', 'RECOVERED'] }, '$amount', 0],
            },
          },
        },
      },
    ]);

    const eventTypeBreakdown = ['PAYMENT_FAILURE', 'CHECKOUT_ABANDONMENT', 'SUBSCRIPTION_FAILURE', 'OVERDUE_RECEIVABLE'].map(type => {
      const found = eventTypeStats.find(s => s._id === type);
      return {
        eventType: type,
        count: found?.totalCount || 0,
        totalAmount: found?.totalAmount || 0,
        atRiskAmount: found?.atRiskAmount || 0,
        recoveredAmount: found?.recoveredAmount || 0,
        recoveryRate: found?.totalAmount > 0 ? Number(((found.recoveredAmount / found.totalAmount) * 100).toFixed(1)) : 0,
      };
    });

    // 3. 14-Day Timeline Trend (Recovered vs At Risk)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 3600 * 1000);
    const dailyTrends = await Transaction.aggregate([
      {
        $match: {
          timestamp: { $gte: fourteenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%b %d', date: '$timestamp' } },
          dateRaw: { $min: '$timestamp' },
          atRisk: {
            $sum: {
              $cond: [{ $ne: ['$recoveryStatus', 'RECOVERED'] }, '$amount', 0],
            },
          },
          recovered: {
            $sum: {
              $cond: [{ $eq: ['$recoveryStatus', 'RECOVERED'] }, '$amountRecovered', 0],
            },
          },
        },
      },
      { $sort: { dateRaw: 1 } },
    ]);

    // 4. Actionable Recovery Queue (Filtered by eligibility & ranked by expected recovery value)
    const rawQueue = await Transaction.find({
      recoveryStatus: { $in: ['NOT_STARTED', 'ANALYZED', 'IN_PROGRESS', 'ACTION_RECOMMENDED', 'FAILED'] },
      retryCount: { $lt: 3 },
    }).limit(50);

    const mappedQueue = rawQueue.map((doc) => {
      const obj = doc.toObject();
      const prob = obj.recoveryProbability ?? 65;
      const expectedValue = Math.round((obj.amount * prob) / 100);
      return {
        ...obj,
        expectedRecoveryValue: expectedValue,
        policyStatus: 'ELIGIBLE',
      };
    });

    // Sort by expectedRecoveryValue descending
    mappedQueue.sort((a, b) => b.expectedRecoveryValue - a.expectedRecoveryValue);
    const recoveryQueue = mappedQueue.slice(0, 12);

    // 5. Recent Transactions
    const recentTransactions = await Transaction.find()
      .sort({ timestamp: -1 })
      .limit(10);

    // 6. AI Activity Feed (Derived from actual seed events)
    const recentAuditLogs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(12);

    const aiActivityFeed = recentAuditLogs.map(log => {
      let icon = 'alert';
      let title = log.event.replace(/_/g, ' ');
      let tone = 'neutral';

      if (log.event.includes('SUCCEEDED') || log.event.includes('RECOVERED')) {
        icon = 'check-circle';
        tone = 'success';
      } else if (log.event.includes('FAILED') || log.event.includes('RISK')) {
        icon = 'alert-triangle';
        tone = 'warning';
      } else if (log.actor.startsWith('AI_')) {
        icon = 'cpu';
        tone = 'ai';
      }

      return {
        id: log._id,
        transactionId: log.transactionId,
        event: log.event,
        title,
        actor: log.actor,
        timestamp: log.timestamp,
        metadata: log.metadata,
        tone,
        icon,
      };
    });

    res.json({
      success: true,
      data: {
        kpis: {
          revenueAtRisk,
          revenueRecovered,
          recoveryRate,
          actionsExecuted,
          atRiskCount,
          recoveredCount,
        },
        eventTypeBreakdown,
        dailyTrends,
        recoveryQueue,
        recentTransactions,
        aiActivityFeed,
      },
    });
  } catch (error) {
    console.error('[DashboardController] Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to aggregate dashboard metrics',
      error: error.message,
    });
  }
};
