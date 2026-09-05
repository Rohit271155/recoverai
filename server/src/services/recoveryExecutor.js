// Recovery Executor Service
// Orchestrates policy re-validation, tool dispatching, outcome simulation, and audit trail

import { Transaction, Customer, Policy, RecoveryAction, AuditLog } from '../models/index.js';
import { detectRisk } from '../agents/riskDetector.js';
import { generateStrategy } from '../agents/recoveryStrategist.js';
import { validatePolicy } from '../policies/policyEngine.js';
import { getToolForAction } from '../tools/index.js';
import { simulateOutcome } from '../simulation/simulator.js';

export const executeRecovery = async (transactionId, options = {}) => {
  // 1. Validate & Load Transaction
  const transaction = await Transaction.findOne({
    $or: [{ transactionId }, { _id: transactionId.match(/^[0-9a-fA-F]{24}$/) ? transactionId : null }],
  });

  if (!transaction) {
    const error = new Error(`Transaction ${transactionId} not found`);
    error.statusCode = 404;
    throw error;
  }

  // 2. Strict Idempotency & Terminal State Protection
  if (transaction.resolved || transaction.recoveryStatus === 'RECOVERED') {
    const now = new Date();
    await AuditLog.create({
      transactionId: transaction.transactionId,
      event: 'RECOVERY_REJECTED_ALREADY_RECOVERED',
      actor: 'RECOVERY_EXECUTOR',
      timestamp: now,
      metadata: {
        reason: 'Duplicate recovery execution attempt rejected for already resolved transaction.',
        amountRecovered: transaction.amountRecovered || transaction.resolvedAmount,
      },
    });

    return {
      success: false,
      allowed: false,
      alreadyRecovered: true,
      code: 'ALREADY_RESOLVED',
      transactionId: transaction.transactionId,
      amountRecovered: transaction.amountRecovered || transaction.resolvedAmount || transaction.amount,
      recoveryStatus: 'RECOVERED',
      message: `This transaction (${transaction.transactionId}) has already been resolved for ₹${(transaction.amountRecovered || transaction.amount).toLocaleString('en-IN')}.`,
    };
  }

  if (
    transaction.recoveryStatus === 'STOPPED' ||
    transaction.recoveryStatus === 'ESCALATED' ||
    transaction.recoveryStatus === 'RECOVERY_FAILED'
  ) {
    return {
      success: false,
      allowed: false,
      code: 'TERMINAL_STATE',
      transactionId: transaction.transactionId,
      recoveryStatus: transaction.recoveryStatus,
      message: `Recovery execution blocked: transaction is in terminal status '${transaction.recoveryStatus}'.`,
    };
  }

  if (transaction.recoveryStatus === 'EXECUTING') {
    return {
      success: false,
      allowed: false,
      inFlight: true,
      code: 'IN_FLIGHT',
      transactionId: transaction.transactionId,
      recoveryStatus: 'EXECUTING',
      message: `Recovery execution is currently in flight for transaction ${transaction.transactionId}.`,
    };
  }

  // Atomic Execution Lock Acquisition (Prevents Race Conditions & Double-Clicks)
  const lockedTxn = await Transaction.findOneAndUpdate(
    {
      _id: transaction._id,
      resolved: { $ne: true },
      recoveryStatus: {
        $nin: ['RECOVERED', 'STOPPED', 'ESCALATED', 'RECOVERY_FAILED', 'EXECUTING'],
      },
    },
    {
      $set: { recoveryStatus: 'EXECUTING' },
    },
    { new: true }
  );

  if (!lockedTxn) {
    const freshTxn = await Transaction.findById(transaction._id);
    if (freshTxn?.resolved || freshTxn?.recoveryStatus === 'RECOVERED') {
      return {
        success: false,
        allowed: false,
        alreadyRecovered: true,
        code: 'ALREADY_RESOLVED',
        transactionId: transaction.transactionId,
        amountRecovered: freshTxn.amountRecovered || freshTxn.resolvedAmount || freshTxn.amount,
        recoveryStatus: 'RECOVERED',
        message: `This transaction (${transaction.transactionId}) has already been resolved.`,
      };
    }
    return {
      success: false,
      allowed: false,
      inFlight: true,
      code: 'IN_FLIGHT',
      transactionId: transaction.transactionId,
      recoveryStatus: freshTxn?.recoveryStatus || 'EXECUTING',
      message: `Recovery execution lock could not be acquired for transaction ${transaction.transactionId}.`,
    };
  }

  // 3. Load Customer & Active Policy
  const customer = await Customer.findOne({ customerId: transaction.customerId });
  let policy = await Policy.findOne({ isActive: true });
  if (!policy) {
    policy = {
      maxRetries: 3,
      retryIntervalHours: 6,
      maxContactAttempts: 3,
      maxDiscountPercent: 10,
      escalationThreshold: 50000,
    };
  }

  // 4. Ensure Prior Analysis Exists, or Run Fresh Decision Pipeline
  let risk = transaction.metadata?.riskAnalysis;
  let strategy = transaction.metadata?.strategyAnalysis;

  if (!strategy || !strategy.recommendedAction) {
    risk = await detectRisk({ transaction, customer });
    strategy = await generateStrategy({ transaction, customer, riskAnalysis: risk });
  }

  // 5. CRITICAL: Backend Re-validates Policy Immediately Before Execution
  const policyResult = validatePolicy({
    transaction,
    customer,
    policy,
    aiRecommendation: strategy,
  });

  const now = new Date();

  // 6. Handle Policy Rejection / Blocked Execution
  if (!policyResult.allowed) {
    // Record Blocked Audit Log
    await AuditLog.create({
      transactionId: transaction.transactionId,
      event: 'RECOVERY_BLOCKED',
      actor: 'POLICY_ENGINE',
      timestamp: now,
      metadata: {
        requestedAction: strategy.recommendedAction,
        effectiveAction: policyResult.effectiveAction,
        violations: policyResult.violations,
        reason: policyResult.reason,
      },
    });

    // Update Transaction State
    if (policyResult.effectiveAction === 'ESCALATE_TO_HUMAN') {
      transaction.recoveryStatus = 'ESCALATED';
      transaction.status = 'ESCALATED';
    } else {
      transaction.recoveryStatus = 'STOPPED';
      transaction.status = 'STOPPED';
    }

    transaction.metadata = {
      ...(transaction.metadata || {}),
      policyCheck: policyResult,
      blockedAt: now.toISOString(),
    };
    await transaction.save();

    // Record Blocked Recovery Action
    await RecoveryAction.create({
      transactionId: transaction.transactionId,
      action: strategy.recommendedAction,
      reason: policyResult.reason,
      probability: strategy.recoveryProbability || 0,
      status: 'BLOCKED',
      executedAt: now,
      result: { blocked: true, violations: policyResult.violations },
      amountRecovered: 0,
      failureReason: policyResult.violations.join('; '),
    });

    return {
      success: false,
      allowed: false,
      transactionId: transaction.transactionId,
      action: strategy.recommendedAction,
      effectiveAction: policyResult.effectiveAction,
      reason: policyResult.reason,
      violations: policyResult.violations,
      policy: policyResult,
      recoveryStatus: transaction.recoveryStatus,
    };
  }

  // 7. Policy Allowed: Begin Execution Lifecycle
  transaction.recoveryStatus = 'EXECUTING';
  await transaction.save();

  // Audit Events: Execution Started & Policy Revalidated
  await AuditLog.insertMany([
    {
      transactionId: transaction.transactionId,
      event: 'POLICY_REVALIDATED',
      actor: 'POLICY_ENGINE',
      timestamp: now,
      metadata: {
        action: strategy.recommendedAction,
        allowed: true,
        verifiedRules: policyResult.policyChecks?.map((c) => c.rule),
      },
    },
    {
      transactionId: transaction.transactionId,
      event: 'RECOVERY_EXECUTION_STARTED',
      actor: 'RECOVERY_EXECUTOR',
      timestamp: new Date(now.getTime() + 50),
      metadata: {
        action: strategy.recommendedAction,
        amount: transaction.amount,
      },
    },
  ]);

  // 8. Dispatch Recovery Tool & Simulation
  const tool = getToolForAction(strategy.recommendedAction);
  const simulationOutcome = simulateOutcome({
    transaction,
    customer,
    action: strategy.recommendedAction,
    probability: strategy.recoveryProbability,
  });

  const toolResult = await tool.execute({
    transaction,
    customer,
    simulationOutcome,
    reason: strategy.rationale,
  });

  const executedAt = new Date(now.getTime() + 150);

  // 9. Process Final Outcome & Transition States
  if (toolResult.isEscalation || strategy.recommendedAction === 'ESCALATE_TO_HUMAN') {
    transaction.recoveryStatus = 'ESCALATED';
    transaction.status = 'ESCALATED';
    transaction.amountRecovered = 0;

    await AuditLog.create({
      transactionId: transaction.transactionId,
      event: 'HUMAN_ESCALATION_CREATED',
      actor: 'RECOVERY_EXECUTOR',
      timestamp: executedAt,
      metadata: { ticketId: toolResult.ticketId, reason: toolResult.escalationReason },
    });
  } else if (toolResult.isStopped || strategy.recommendedAction === 'STOP_RECOVERY') {
    transaction.recoveryStatus = 'STOPPED';
    transaction.status = 'STOPPED';
    transaction.amountRecovered = 0;

    await AuditLog.create({
      transactionId: transaction.transactionId,
      event: 'RECOVERY_STOPPED',
      actor: 'RECOVERY_EXECUTOR',
      timestamp: executedAt,
      metadata: { reason: toolResult.message },
    });
  } else if (simulationOutcome.success) {
    transaction.recoveryStatus = 'RECOVERED';
    transaction.status = 'RECOVERED';
    transaction.resolved = true;
    transaction.resolvedAt = executedAt;
    transaction.resolvedAmount = simulationOutcome.amountRecovered;
    transaction.amountRecovered = simulationOutcome.amountRecovered;

    await AuditLog.create({
      transactionId: transaction.transactionId,
      event: 'PAYMENT_RECOVERED',
      actor: 'RECOVERY_TOOL',
      timestamp: executedAt,
      metadata: {
        action: strategy.recommendedAction,
        amountRecovered: simulationOutcome.amountRecovered,
        gatewayRef: toolResult.gatewayRef || toolResult.paymentUrl,
        result: 'PAYMENT_RECOVERED',
      },
    });
  } else {
    transaction.recoveryStatus = 'RECOVERY_FAILED';
    transaction.retryCount = (transaction.retryCount || 0) + 1;
    transaction.amountRecovered = 0;
    transaction.metadata = {
      ...(transaction.metadata || {}),
      lastRetryAt: executedAt.toISOString(),
      contactAttempts: (transaction.metadata?.contactAttempts || 0) + 1,
    };

    await AuditLog.create({
      transactionId: transaction.transactionId,
      event: 'RECOVERY_FAILED',
      actor: 'RECOVERY_TOOL',
      timestamp: executedAt,
      metadata: {
        action: strategy.recommendedAction,
        reason: simulationOutcome.message,
      },
    });
  }

  transaction.metadata = {
    ...(transaction.metadata || {}),
    lastExecutionResult: toolResult,
    lastExecutedAt: executedAt.toISOString(),
  };
  await transaction.save();

  // Record RecoveryAction
  await RecoveryAction.create({
    transactionId: transaction.transactionId,
    action: strategy.recommendedAction,
    reason: strategy.rationale,
    probability: strategy.recoveryProbability || 0,
    status: simulationOutcome.success ? 'SUCCESS' : (toolResult.isEscalation ? 'ESCALATED' : 'FAILED'),
    executedAt,
    result: toolResult,
    amountRecovered: transaction.amountRecovered,
    failureReason: simulationOutcome.success ? '' : simulationOutcome.message,
  });

  return {
    success: simulationOutcome.success,
    allowed: true,
    transactionId: transaction.transactionId,
    action: strategy.recommendedAction,
    policy: policyResult,
    execution: toolResult,
    recoveryStatus: transaction.recoveryStatus,
    amountRecovered: transaction.amountRecovered,
    timestamp: executedAt.toISOString(),
  };
};

export default { executeRecovery };
