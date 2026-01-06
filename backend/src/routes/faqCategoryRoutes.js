import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorization.js';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/faqCategoryController.js';

const router = express.Router();

// Route công khai
router.get('/', getAllCategories);

// Route Admin
router.post('/', authenticateToken, authorize('admin'), createCategory);
router.put('/:id', authenticateToken, authorize('admin'), updateCategory);
router.delete('/:id', authenticateToken, authorize('admin'), deleteCategory);

export default router;
