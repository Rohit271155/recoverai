import mongoose from 'mongoose';

const policySchema = new mongoose.Schema(
  {
    policyId: {
      type: String,
      default: 'default_policy',
      unique: true,
      index: true,
    },
    maxRetries: {
      type: Number,
      default: 3,
      min: 1,
    },
    retryIntervalHours: {
      type: Number,
      default: 6,
      min: 1,
    },
    maxContactAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    maxDiscountPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    escalationThreshold: {
      type: Number,
      default: 50000,
      min: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Policy = mongoose.model('Policy', policySchema);
export default Policy;
