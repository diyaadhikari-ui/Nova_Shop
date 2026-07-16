import express from 'express';
import {
  getInventory,
  getInventoryItem,
  updateInventory,
  getLowStockItems,
  getOutOfStockItems
} from '../controllers/inventoryController.js';  // ✅ ADD ../controllers/
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/', getInventory);
router.get('/low-stock', getLowStockItems);
router.get('/out-of-stock', getOutOfStockItems);
router.get('/:id', getInventoryItem);
router.put('/:id', updateInventory);

export default router;