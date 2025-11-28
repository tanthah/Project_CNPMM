import express from 'express';
import multer from 'multer';
import path from 'path';
import {getUserProfile, updateUserProfile, uploadAvatar} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { isUserOrAdmin } from '../middleware/authorization.js';
import { updateProfileValidation } from '../middleware/validators.js';
import { apiLimiter, uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh (JPG, PNG, GIF, WEBP)'));
    }
  }
});

// Routes với Authentication + Authorization + Rate Limiting

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
  upload.single('avatar'), 
  uploadAvatar
);

export default router;