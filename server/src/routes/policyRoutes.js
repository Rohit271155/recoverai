import express from 'express';
import { Policy } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let policy = await Policy.findOne({ isActive: true });
    if (!policy) {
      policy = await Policy.create({
        policyId: 'default_policy',
        maxRetries: 3,
        retryIntervalHours: 6,
        maxContactAttempts: 3,
        maxDiscountPercent: 10,
        escalationThreshold: 50000,
        isActive: true,
      });
    }
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { maxRetries, retryIntervalHours, maxContactAttempts, maxDiscountPercent, escalationThreshold } = req.body;
    const policy = await Policy.findOneAndUpdate(
      { policyId: 'default_policy' },
      { maxRetries, retryIntervalHours, maxContactAttempts, maxDiscountPercent, escalationThreshold },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
