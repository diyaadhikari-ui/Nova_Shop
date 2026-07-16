import express from 'express';
import {
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
  createStripeCheckoutSession,
  confirmStripePayment
} from '../controllers/paymentController.js';

import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// eSewa
router.post('/initiate', authenticate, initiatePayment);
router.post('/verify', verifyPayment);

// Stripe
router.post(
  '/stripe/create-checkout-session',
  authenticate,
  createStripeCheckoutSession
);

router.post(
  '/stripe/confirm',
  authenticate,
  confirmStripePayment
);

// Payment Status
router.get(
  '/status/:orderId',
  authenticate,
  getPaymentStatus
);

export default router;