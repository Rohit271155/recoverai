import express from 'express';
import { Transaction } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const subscriptions = await Transaction.find({ eventType: 'SUBSCRIPTION_FAILURE' })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
