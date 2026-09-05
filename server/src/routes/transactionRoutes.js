import express from 'express';
import {
  getTransactions,
  getTransactionById,
  analyzeTransaction,
  addToQueue,
} from '../controllers/transactionController.js';
import { recoverTransaction } from '../controllers/recoveryController.js';

const router = express.Router();

router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/:id/analyze', analyzeTransaction);
router.post('/:id/queue', addToQueue);
router.post('/:id/recover', recoverTransaction);
router.post('/:id/resolve', recoverTransaction);

export default router;
