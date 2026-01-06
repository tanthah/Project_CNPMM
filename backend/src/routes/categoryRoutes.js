
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

// Route công khai
router.get('/', getAllCategories);
router.get('/:id', getCategoryDetail);
router.get('/:id/products', getProductsByCategory);

// Route Admin - TODO: Thêm middleware xác thực
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;