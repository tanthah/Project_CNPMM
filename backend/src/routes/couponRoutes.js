
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorization.js';
import {
  getUserCoupons,
  validateCoupon,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  getPublicCoupons
} from '../controllers/couponController.js';

const router = express.Router();

// Route công khai
router.get('/public', getPublicCoupons);

// Route khách hàng
router.use(authenticateToken);

router.get('/user', getUserCoupons);
router.post('/validate', validateCoupon);

// Route Admin
router.post('/create', authorize('admin'), createCoupon);
router.get('/all', authorize('admin'), getAllCoupons);
router.put('/:couponId', authorize('admin'), updateCoupon);
router.delete('/:couponId', authorize('admin'), deleteCoupon);

export default router;