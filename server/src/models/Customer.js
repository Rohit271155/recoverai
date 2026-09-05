import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    totalPayments: {
      type: Number,
      default: 0,
    },
    successfulPayments: {
      type: Number,
      default: 0,
    },
    failedPayments: {
      type: Number,
      default: 0,
    },
    lifetimeValue: {
      type: Number,
      default: 0,
    },
    previousSuccessfulPayments: {
      type: Number,
      default: 0,
    },
    customerSegment: {
      type: String,
      enum: ['ENTERPRISE', 'MID_MARKET', 'SMB', 'RETAIL_VIP', 'RETAIL_STANDARD'],
      default: 'SMB',
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

export const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
