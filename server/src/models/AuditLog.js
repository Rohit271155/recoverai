import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      index: true,
    },
    event: {
      type: String,
      required: true,
    },
    actor: {
      type: String,
      required: true,
      enum: [
        'SYSTEM',
        'AI_RISK_DETECTOR',
        'AI_RECOVERY_STRATEGIST',
        'POLICY_ENGINE',
        'RECOVERY_EXECUTOR',
        'RECOVERY_TOOL',
        'RECOVERY_ANALYST',
        'HUMAN_OPERATOR',
      ],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
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

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
