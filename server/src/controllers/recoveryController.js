import { executeRecovery } from '../services/recoveryExecutor.js';
import { runBatchRecovery } from '../services/batchRecoveryService.js';
import { Transaction, RecoveryAction } from '../models/index.js';

export const recoverTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await executeRecovery(id);

    if (!result.allowed) {
      const isConflict = ['ALREADY_RESOLVED', 'ALREADY_RECOVERED', 'TERMINAL_STATE', 'IN_FLIGHT'].includes(result.code);
      const status = isConflict ? 409 : 403;
      return res.status(status).json({
        success: false,
        allowed: false,
        code: result.code || 'BLOCKED',
        message: result.message,
        data: result,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error(`[RecoverTransaction] Failed for ${req.params.id}:`, error.message);
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActionableQueue = async (req, res) => {
  try {
    const { search, eventType, limit = 50 } = req.query;

    const query = {
      resolved: { $ne: true },
      recoveryStatus: { $in: ['NOT_STARTED', 'ANALYZED', 'IN_PROGRESS', 'ACTION_RECOMMENDED', 'FAILED', 'RECOVERY_FAILED'] },
      status: { $nin: ['RECOVERED', 'STOPPED', 'ESCALATED'] },
      retryCount: { $lt: 3 },
      amount: { $lt: 50000 },
    };

    if (eventType && eventType !== 'ALL') {
      query.eventType = eventType;
    }

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
      ];
    }

    const rawTxns = await Transaction.find(query).limit(Number(limit) * 2);
    const nowMs = Date.now();
    const cooldownMs = 6 * 3600 * 1000;

    const mapped = rawTxns
      .filter((doc) => {
        // Exclude items currently in active retry cooldown (< 6 hours)
        if (doc.metadata?.lastRetryAt) {
          const lastRetryTime = new Date(doc.metadata.lastRetryAt).getTime();
          if (nowMs - lastRetryTime < cooldownMs) {
            return false;
          }
        }
        return true;
      })
      .map((doc) => {
        const obj = doc.toObject();
        const prob = obj.recoveryProbability ?? 65;
        const expectedValue = Math.round((obj.amount * prob) / 100);
        return {
          ...obj,
          expectedRecoveryValue: expectedValue,
          policyStatus: 'ELIGIBLE',
        };
      });

    // Rank by expected recovery value descending
    mapped.sort((a, b) => b.expectedRecoveryValue - a.expectedRecoveryValue);
    const queue = mapped.slice(0, Number(limit));

    res.json({
      success: true,
      count: queue.length,
      data: queue,
    });
  } catch (error) {
    console.error('[GetActionableQueue] Failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch actionable recovery queue',
      error: error.message,
    });
  }
};

export const batchRecoverTransactions = async (req, res) => {
  try {
    const { batchSize = 25 } = req.body;
    const result = await runBatchRecovery({ batchSize });
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[BatchRecoverTransactions] Failed:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecoveryActions = async (req, res) => {
  try {
    const { transactionId, status, limit = 50 } = req.query;
    const query = {};
    if (transactionId) query.transactionId = transactionId;
    if (status) query.status = status;

    const actions = await RecoveryAction.find(query).sort({ executedAt: -1 }).limit(Number(limit));
    res.json({ success: true, data: actions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
