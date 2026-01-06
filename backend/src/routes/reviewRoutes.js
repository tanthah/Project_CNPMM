
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
  getAllReviewsAdmin,
  getReviewStats,
  toggleReviewVisibility,
  deleteReviewAdmin
} from '../controllers/reviewController.js';

const router = express.Router();

// Route khách hàng
router.use(authenticateToken);

router.post('/create', createReview);
router.get('/pending', getPendingReviews);
router.get('/user', getUserReviews);
router.get('/product/:productId', getProductReviews);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

// Route Admin
router.get('/admin/stats', authorize('admin'), getReviewStats);
router.get('/admin/list', authorize('admin'), getAllReviewsAdmin);
router.patch('/admin/:reviewId/toggle', authorize('admin'), toggleReviewVisibility);
router.delete('/admin/:reviewId', authorize('admin'), deleteReviewAdmin);

export default router;