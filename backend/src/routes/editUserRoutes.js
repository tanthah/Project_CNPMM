
import express from 'express';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { isUserOrAdmin } from '../middleware/authorization.js';
import { updateProfileValidation } from '../middleware/validators.js';
import { apiLimiter, uploadLimiter } from '../middleware/rateLimiter.js';
import upload from '../utils/cloudinary.js'; // Import từ cloudinary config

const router = express.Router();

// Routes với Xác thực + Phân quyền + Giới hạn tốc độ

// GET /api/user/profile
// Chỉ user đã đăng nhập mới xem được profile của chính họ
router.get('/profile',
  apiLimiter,
  authenticateToken,
  isUserOrAdmin,
  getUserProfile
);

// PUT /api/user/profile
// Chỉ user đã đăng nhập mới cập nhật được profile của chính họ
router.put('/profile',
  apiLimiter,
  authenticateToken,
  isUserOrAdmin,
  updateProfileValidation,
  updateUserProfile
);

// POST /api/user/upload-avatar
// Chỉ user đã đăng nhập mới upload được avatar của chính họ
router.post('/upload-avatar',
  uploadLimiter,
  authenticateToken,
  isUserOrAdmin,
  upload.single('avatar'), // Sử dụng Cloudinary upload
  uploadAvatar
);

export default router;