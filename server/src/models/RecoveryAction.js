import mongoose from 'mongoose';

const recoveryActionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'RETRY_PAYMENT',
        'SEND_PAYMENT_REMINDER',
        'GENERATE_PAYMENT_LINK',
        'SEND_CHECKOUT_RECOVERY',
        'ESCALATE_TO_HUMAN',
        'STOP_RECOVERY',
      ],
      index: true,
    },
    reason: {
      type: String,
      default: '',
    },
    probability: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'EXECUTING', 'EXECUTED', 'SUCCESS', 'FAILED', 'BLOCKED', 'ESCALATED', 'STOPPED'],
      default: 'EXECUTED',
      index: true,
    },
    executedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    amountRecovered: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const RecoveryAction = mongoose.model('RecoveryAction', recoveryActionSchema);
export default RecoveryAction;
