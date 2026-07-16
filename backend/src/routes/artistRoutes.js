import express from 'express';
import {
  getArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist
} from '../controllers/artistController.js';  // ✅ ADD ../controllers/
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getArtists);
router.get('/:id', getArtistById);
router.post('/', authenticate, requireAdmin, createArtist);
router.put('/:id', authenticate, requireAdmin, updateArtist);
router.delete('/:id', authenticate, requireAdmin, deleteArtist);

export default router;