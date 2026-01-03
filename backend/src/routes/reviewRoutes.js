// backend/src/routes/reviewRoutes.js
// ========================================
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorization.js';
import {
  createReview,
  getPendingReviews,
  getUserReviews,
  getProductReviews,
  updateReview,
  deleteReview,
  replyToReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Customer routes
router.use(authenticateToken);

router.post('/create', createReview);
router.get('/pending', getPendingReviews);
router.get('/user', getUserReviews);
router.get('/product/:productId', getProductReviews);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

// Admin routes
router.post('/:reviewId/reply', authorize('admin'), replyToReview);

export default router;