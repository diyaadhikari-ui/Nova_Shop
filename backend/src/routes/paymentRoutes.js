import express from 'express';
import {
  initiatePayment,
  verifyPayment,
  getPaymentStatus
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate', authenticate, initiatePayment);
router.post('/verify', verifyPayment);
router.get('/status/:orderId', authenticate, getPaymentStatus);

export default router;