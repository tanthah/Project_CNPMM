// backend/src/routes/wishlistRoutes.js - ENHANCED
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  checkMultipleWishlist,
  clearWishlist
} from '../controllers/wishlistController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/remove/:productId', removeFromWishlist);
router.get('/check/:productId', checkWishlist);
router.post('/check-multiple', checkMultipleWishlist); // ✅ NEW: Batch check
router.delete('/clear', clearWishlist);

export default router;
