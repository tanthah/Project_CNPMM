// backend/src/routes/orderRoutes.js - ENHANCED
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorization.js';
import {
    createOrder,
    getUserOrders,
    getOrderDetail,
    cancelOrder,
    getOrderStatusHistory,
    getOrderStatistics
} from '../controllers/orderController.js';

const router = express.Router();

// ✅ CUSTOMER ROUTES
router.use(authenticateToken);

// Create order
router.post('/create', createOrder);

// Get user orders (with optional status filter)
// Example: /orders?status=new
router.get('/', getUserOrders);

// Get order statistics
router.get('/statistics', getOrderStatistics);

// Get order detail
router.get('/:orderId', getOrderDetail);

// Get order status history
router.get('/:orderId/history', getOrderStatusHistory);

// Cancel order
router.put('/:orderId/cancel', cancelOrder);

// Note: Admin-specific order APIs are defined under /api/admin routes.

export default router;
