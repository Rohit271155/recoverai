import express from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/', getDashboardMetrics);

export default router;
