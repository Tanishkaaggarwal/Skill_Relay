import express from 'express';
import {
  acceptApplicantAndCreateSession,
  getMySessions,
  getSessionById,
  confirmSessionComplete,
  getSessionMessages,
  sendSessionMessage,
  cancelSession,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/accept', protect, acceptApplicantAndCreateSession);
router.get('/my-sessions', protect, getMySessions);
router.get('/:id', protect, getSessionById);
router.put('/:id/confirm-complete', protect, confirmSessionComplete);
router.get('/:id/messages', protect, getSessionMessages);
router.post('/:id/messages', protect, sendSessionMessage);
router.put('/:id/cancel', protect, cancelSession);

export default router;
