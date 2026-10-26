import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';

// @desc    Get current user transaction ledger history
// @route   GET /api/transactions/my-history
// @access  Private
export const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate('sessionId')
      .populate('postId', 'title type creditAmount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get transaction analytics & credit stats
// @route   GET /api/transactions/stats
// @access  Private
export const getTransactionStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const transactions = await Transaction.find({ userId: req.user._id });

    const totalEarned = transactions
      .filter((t) => t.type === 'credit' || t.type === 'initial_bonus')
      .reduce((acc, curr) => acc + (curr.amount > 0 ? curr.amount : 0), 0);

    const totalSpent = transactions
      .filter((t) => t.type === 'debit')
      .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

    res.json({
      success: true,
      stats: {
        currentBalance: user.creditBalance,
        totalEarned,
        totalSpent,
        sessionsCompleted: user.sessionsCompleted,
        totalTransactions: transactions.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
