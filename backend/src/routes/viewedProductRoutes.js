// backend/src/routes/viewedProductRoutes.js
// ========================================
import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import {
  trackView,
  getViewedProducts,
  clearViewedHistory,
  removeViewedProduct
} from '../controllers/viewedProductController.js';

const router = express.Router();

router.post('/track', optionalAuth, trackView);
router.get('/', authenticateToken, getViewedProducts);
router.delete('/clear', authenticateToken, clearViewedHistory);
router.delete('/remove/:productId', authenticateToken, removeViewedProduct);

export default router;
