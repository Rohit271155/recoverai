// Batch Recovery Service for Autonomous Revenue Recovery
import { Transaction } from '../models/index.js';
import { executeRecovery } from './recoveryExecutor.js';

export const runBatchRecovery = async ({ batchSize = 25 } = {}) => {
  // Cap batch size between 1 and 100
  const limit = Math.max(1, Math.min(100, Number(batchSize) || 25));

  // Find eligible at-risk transactions (excluding already recovered, stopped, escalated, or high-value items)
  const eligibleTransactions = await Transaction.find({
    recoveryStatus: { $in: ['NOT_STARTED', 'ANALYZED', 'FAILED', 'RECOVERY_FAILED', 'ACTION_RECOMMENDED', 'IN_PROGRESS'] },
    status: { $nin: ['RECOVERED', 'STOPPED', 'ESCALATED'] },
    retryCount: { $lt: 3 },
    amount: { $lt: 50000 },
  })
    .sort({ recoveryProbability: -1, amount: -1 })
    .limit(limit);

  const results = {
    batchSize: limit,
    processed: 0,
    successfulRecoveries: 0,
    failedRecoveries: 0,
    blocked: 0,
    escalated: 0,
    revenueRecovered: 0,
    items: [],
  };

  for (const txn of eligibleTransactions) {
    try {
      const execResult = await executeRecovery(txn.transactionId);
      results.processed++;

      if (execResult.alreadyRecovered) {
        continue;
      }

      if (!execResult.allowed) {
        results.blocked++;
        results.items.push({
          transactionId: txn.transactionId,
          status: 'BLOCKED',
          action: execResult.action,
          reason: execResult.reason,
        });
      } else if (execResult.recoveryStatus === 'ESCALATED') {
        results.escalated++;
        results.items.push({
          transactionId: txn.transactionId,
          status: 'ESCALATED',
          action: execResult.action,
        });
      } else if (execResult.success) {
        results.successfulRecoveries++;
        results.revenueRecovered += execResult.amountRecovered || 0;
        results.items.push({
          transactionId: txn.transactionId,
          status: 'RECOVERED',
          amountRecovered: execResult.amountRecovered,
          action: execResult.action,
        });
      } else {
        results.failedRecoveries++;
        results.items.push({
          transactionId: txn.transactionId,
          status: 'FAILED',
          action: execResult.action,
        });
      }
    } catch (itemError) {
      console.error(`[BatchRecovery] Error processing ${txn.transactionId}:`, itemError.message);
    }
  }

  return results;
};

export default { runBatchRecovery };
