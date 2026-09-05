import express from 'express';
import { Customer } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { segment, search, limit = 50 } = req.query;
    const query = {};
    if (segment) query.customerSegment = segment;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(query).sort({ lifetimeValue: -1 }).limit(Number(limit));
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ customerId: req.params.id });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
