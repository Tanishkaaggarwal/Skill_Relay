import express from 'express';
import {
  getMyTransactions,
  getTransactionStats,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-history', protect, getMyTransactions);
router.get('/stats', protect, getTransactionStats);

export default router;
