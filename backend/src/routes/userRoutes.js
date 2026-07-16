import express from 'express';
import {
  getUsers,
  getUserById,
  deactivateUser,
  reactivateUser,
  deleteUser
} from '../controllers/userController.js';  // ✅ ADD ../controllers/
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/deactivate', deactivateUser);
router.put('/:id/reactivate', reactivateUser);
router.delete('/:id', deleteUser);

export default router;