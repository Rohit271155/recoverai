import { Transaction, Customer, Policy, AuditLog } from '../models/index.js';
import { detectRisk } from '../agents/riskDetector.js';
import { generateStrategy } from '../agents/recoveryStrategist.js';
import { validatePolicy } from '../policies/policyEngine.js';

export const getTransactions = async (req, res) => {
  try {
    const { eventType, status, recoveryStatus, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (eventType) query.eventType = eventType;
    if (status) query.status = status;
    if (recoveryStatus) query.recoveryStatus = recoveryStatus;
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)),
      Transaction.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({
      $or: [{ transactionId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: `Transaction ${id} not found` });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToQueue = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({
      $or: [{ transactionId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: `Transaction ${id} not found` });
    }

    if (transaction.resolved || transaction.recoveryStatus === 'RECOVERED') {
      return res.status(409).json({
        success: false,
        code: 'ALREADY_RESOLVED',
        message: `Transaction ${transaction.transactionId} has already been resolved and cannot be queued.`,
      });
    }

    if (transaction.isInRecoveryQueue) {
      return res.json({
        success: true,
        alreadyQueued: true,
        message: `Transaction ${transaction.transactionId} is already in the recovery queue.`,
        data: transaction,
      });
    }

    transaction.isInRecoveryQueue = true;
    transaction.queuedAt = new Date();
    await transaction.save();

    await AuditLog.create({
      transactionId: transaction.transactionId,
      event: 'RECOVERY_QUEUE_ADDED',
      actor: 'USER_OPERATIONS',
      timestamp: new Date(),
      metadata: {
        amount: transaction.amount,
        eventType: transaction.eventType,
        customerName: transaction.customerName,
      },
    });

    res.json({
      success: true,
      message: `Transaction ${transaction.transactionId} promoted to active recovery queue.`,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/transactions/:id/analyze
 * Executes Risk Detection -> Recovery Strategy -> Policy Validation
 */
export const analyzeTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Locate Transaction
    const transaction = await Transaction.findOne({
      $or: [{ transactionId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: `Transaction ${id} not found` });
    }

    // 2. Locate Customer
    const customer = await Customer.findOne({ customerId: transaction.customerId });

    // 3. Load Policy Rules
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

    // 4. Run AI Agent 1: Risk Detector
    const risk = await detectRisk({ transaction, customer });

    // 5. Run AI Agent 2: Recovery Strategist
    const strategy = await generateStrategy({ transaction, customer, riskAnalysis: risk });

    // 6. Run Deterministic Policy Engine
    const policyResult = validatePolicy({
      transaction,
      customer,
      policy,
      aiRecommendation: strategy,
    });

    // 7. Update Transaction Document (Protect terminal states)
    if (!['RECOVERED', 'STOPPED', 'ESCALATED'].includes(transaction.recoveryStatus)) {
      transaction.recoveryStatus = 'ANALYZED';
    }
    transaction.recoveryProbability = strategy.recoveryProbability;
    transaction.recommendedAction = strategy.recommendedAction;
    transaction.metadata = {
      ...(transaction.metadata || {}),
      riskAnalysis: risk,
      strategyAnalysis: strategy,
      policyCheck: policyResult,
      lastAnalyzedAt: new Date().toISOString(),
    };
    await transaction.save();

    // 8. Record Real Audit Logs
    const now = new Date();
    await AuditLog.insertMany([
      {
        transactionId: transaction.transactionId,
        event: 'RISK_DETECTED',
        actor: 'AI_RISK_DETECTOR',
        timestamp: now,
        metadata: {
          riskLevel: risk.riskLevel,
          riskScore: risk.riskScore,
          revenueAtRisk: transaction.amount,
        },
      },
      {
        transactionId: transaction.transactionId,
        event: 'RECOVERY_STRATEGY_GENERATED',
        actor: 'AI_RECOVERY_STRATEGIST',
        timestamp: new Date(now.getTime() + 50),
        metadata: {
          recoveryProbability: strategy.recoveryProbability,
          recommendedAction: strategy.recommendedAction,
          fallbackAction: strategy.fallbackAction,
        },
      },
      {
        transactionId: transaction.transactionId,
        event: 'POLICY_CHECK_COMPLETED',
        actor: 'POLICY_ENGINE',
        timestamp: new Date(now.getTime() + 100),
        metadata: {
          action: strategy.recommendedAction,
          allowed: policyResult.allowed,
          effectiveAction: policyResult.effectiveAction,
          violations: policyResult.violations,
        },
      },
    ]);

    // 9. Return Response
    res.json({
      success: true,
      data: {
        transaction,
        risk,
        strategy,
        policy: policyResult,
        timestamp: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('[AnalyzeTransaction] Analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze transaction',
      error: error.message,
    });
  }
};
