import express from 'express';
import {
  register,
  login,
  getMe,
  refreshToken
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;