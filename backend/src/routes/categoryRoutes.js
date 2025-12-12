// backend/src/routes/categoryRoutes.js
import express from 'express';
import {
    getAllCategories,
    getCategoryDetail,
    getProductsByCategory,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryDetail);
router.get('/:id/products', getProductsByCategory);

// Admin routes - TODO: Add authentication middleware
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;