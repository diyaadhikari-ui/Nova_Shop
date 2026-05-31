import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Customer routes — require login
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);

// Admin routes
router.get('/', authenticate, requireAdmin, getAllOrders);
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;