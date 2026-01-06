
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorization.js';
import {
    getAllFAQs,
    getFAQById,
    createFAQ,
    updateFAQ,
    deleteFAQ
} from '../controllers/faqController.js';

const router = express.Router();

// Route công khai
router.get('/', getAllFAQs);
router.get('/:id', getFAQById);

// Route Admin
router.post('/', authenticateToken, authorize('admin'), createFAQ);
router.put('/:id', authenticateToken, authorize('admin'), updateFAQ);
router.delete('/:id', authenticateToken, authorize('admin'), deleteFAQ);

export default router;
