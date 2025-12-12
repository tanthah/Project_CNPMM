// backend/src/routes/couponRoutes.js
// ========================================
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorization.js';
import {
  getUserCoupons,
  validateCoupon,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon
} from '../controllers/couponController.js';

const router = express.Router();

// Customer routes
router.use(authenticateToken);

router.get('/user', getUserCoupons);
router.post('/validate', validateCoupon);

// Admin routes
router.post('/create', authorize('admin'), createCoupon);
router.get('/all', authorize('admin'), getAllCoupons);
router.put('/:couponId', authorize('admin'), updateCoupon);
router.delete('/:couponId', authorize('admin'), deleteCoupon);

export default router;