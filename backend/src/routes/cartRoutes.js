// backend/src/routes/cartRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cartController.js';

const router = express.Router();

// Tất cả routes yêu cầu đăng nhập
router.use(authenticateToken);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

export default router;