import express from 'express';
import { Transaction, RecoveryAction } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // 1. Core Financial Aggregates
    const atRiskAgg = await Transaction.aggregate([
      {
        $match: {
          recoveryStatus: { $ne: 'RECOVERED' },
          status: { $in: ['FAILED', 'OVERDUE', 'ABANDONED', 'ESCALATED', 'PENDING_ANALYSIS'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const recoveredAgg = await Transaction.aggregate([
      { $match: { recoveryStatus: 'RECOVERED' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountRecovered' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenueAtRisk = atRiskAgg[0]?.total || 0;
    const totalRevenueRecovered = recoveredAgg[0]?.total || 0;
    const totalOpportunity = totalRevenueRecovered + totalRevenueAtRisk;
    const recoveryRate = totalOpportunity > 0 ? Number(((totalRevenueRecovered / totalOpportunity) * 100).toFixed(1)) : 0;

    // 2. Action and Escalation Counts
    const [successfulRecoveries, failedRecoveries, blockedActions, escalations] = await Promise.all([
      RecoveryAction.countDocuments({ status: 'SUCCESS' }),
      RecoveryAction.countDocuments({ status: 'FAILED' }),
      RecoveryAction.countDocuments({ status: 'BLOCKED' }),
      Transaction.countDocuments({ recoveryStatus: 'ESCALATED' }),
    ]);

    // 3. Recovery by Action Strategy
    const recoveryByAction = await RecoveryAction.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          recoveredAmount: { $sum: '$amountRecovered' },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          action: '$_id',
          count: 1,
          recoveredAmount: 1,
          successRate: {
            $cond: [
              { $gt: ['$count', 0] },
              { $round: [{ $multiply: [{ $divide: ['$successCount', '$count'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
    ]);

    // 4. Recovery by Event Type
    const recoveryByEventType = await Transaction.aggregate([
      {
        $group: {
          _id: '$eventType',
          totalCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          recoveredAmount: {
            $sum: { $cond: [{ $eq: ['$recoveryStatus', 'RECOVERED'] }, '$amountRecovered', 0] },
          },
          atRiskAmount: {
            $sum: { $cond: [{ $ne: ['$recoveryStatus', 'RECOVERED'] }, '$amount', 0] },
          },
        },
      },
      {
        $project: {
          eventType: '$_id',
          totalCount: 1,
          totalAmount: 1,
          recoveredAmount: 1,
          atRiskAmount: 1,
          recoveryRate: {
            $cond: [
              { $gt: ['$totalAmount', 0] },
              { $round: [{ $multiply: [{ $divide: ['$recoveredAmount', '$totalAmount'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenueAtRisk,
          totalRevenueRecovered,
          recoveryRate,
          successfulRecoveries,
          failedRecoveries,
          blockedActions,
          escalations,
        },
        recoveryByAction,
        recoveryByEventType,
      },
    });
  } catch (error) {
    console.error('[AnalyticsAPI] Error generating analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
