import express from 'express';
import { getAllUsers, getUserDetail, updateUserAdmin, deleteUserAdmin, uploadAvatarAdmin } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorization.js';
import upload from '../utils/cloudinary.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorize('admin')); // Chỉ Admin

// GET /api/users/admin/list
router.get('/list', getAllUsers);

// GET /api/users/admin/:userId
router.get('/:userId', getUserDetail);

// PATCH /api/users/admin/:userId
router.patch('/:userId', updateUserAdmin);

// DELETE /api/users/admin/:userId
router.delete('/:userId', deleteUserAdmin);

// POST /api/users/admin/:userId/avatar
router.post('/:userId/avatar', upload.single('avatar'), uploadAvatarAdmin);

export default router;
