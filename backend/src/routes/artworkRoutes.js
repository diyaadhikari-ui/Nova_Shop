import express from 'express';
import {
  getArtworks,
  getArtworkBySlug,
  getCategories,
  getFrameOptions,
  getPrintSizes,
  createArtwork,
  updateArtwork,
  deleteArtwork
} from '../controllers/artworkController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getArtworks);
router.get('/categories', getCategories);
router.get('/frame-options', getFrameOptions);
router.get('/print-sizes', getPrintSizes);
router.get('/:slug', getArtworkBySlug);

// Admin only routes
router.post('/', authenticate, requireAdmin, createArtwork);
router.put('/:id', authenticate, requireAdmin, updateArtwork);
router.delete('/:id', authenticate, requireAdmin, deleteArtwork);

export default router;