import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: '',
    },
    customerEmail: {
      type: String,
      default: '',
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'PAYMENT_FAILURE',
        'CHECKOUT_ABANDONMENT',
        'SUBSCRIPTION_FAILURE',
        'OVERDUE_RECEIVABLE',
      ],
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      required: true,
      enum: [
        'FAILED',
        'RECOVERED',
        'PARTIALLY_RECOVERED',
        'ABANDONED',
        'OVERDUE',
        'ESCALATED',
        'STOPPED',
        'PENDING_ANALYSIS',
        'RECOVERY_FAILED',
      ],
      default: 'FAILED',
      index: true,
    },
    failureReason: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'UPI',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    recoveryStatus: {
      type: String,
      enum: [
        'NOT_STARTED',
        'AT_RISK',
        'ANALYZED',
        'READY',
        'IN_PROGRESS',
        'EXECUTING',
        'RECOVERED',
        'FAILED',
        'RECOVERY_FAILED',
        'ESCALATED',
        'STOPPED',
      ],
      default: 'NOT_STARTED',
      index: true,
    },
    recoveryProbability: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    recommendedAction: {
      type: String,
      enum: [
        'RETRY_PAYMENT',
        'SEND_PAYMENT_REMINDER',
        'GENERATE_PAYMENT_LINK',
        'SEND_CHECKOUT_RECOVERY',
        'ESCALATE_TO_HUMAN',
        'STOP_RECOVERY',
        'NONE',
      ],
      default: 'NONE',
    },
    amountRecovered: {
      type: Number,
      default: 0,
      min: 0,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedAmount: {
      type: Number,
      default: 0,
    },
    isInRecoveryQueue: {
      type: Boolean,
      default: true,
      index: true,
    },
    queuedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
