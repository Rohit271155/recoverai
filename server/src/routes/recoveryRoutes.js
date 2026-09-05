import express from 'express';
import {
  getRecoveryActions,
  getActionableQueue,
  batchRecoverTransactions,
} from '../controllers/recoveryController.js';

const router = express.Router();

router.get('/', getRecoveryActions);
router.get('/queue', getActionableQueue);
router.post('/run-batch', batchRecoverTransactions);

export default router;
