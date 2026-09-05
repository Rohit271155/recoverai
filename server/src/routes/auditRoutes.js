import express from 'express';
import { AuditLog } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { transactionId, actor, limit = 50 } = req.query;
    const query = {};
    if (transactionId) query.transactionId = transactionId;
    if (actor) query.actor = actor;

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(Number(limit));
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
