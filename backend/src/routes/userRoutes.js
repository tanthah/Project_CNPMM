import express from 'express';
import multer from 'multer';
import {getUserProfile, updateUserProfile, uploadAvatar} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { storage } from '../utils/cloudinary.js';

const router = express.Router();

const parser = multer({ storage: storage });


// Routes
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.post('/upload-avatar', authenticateToken, parser.single('avatar'), uploadAvatar);

export default router;