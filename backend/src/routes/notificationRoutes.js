// backend/src/routes/notificationRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// GET /api/notifications - Lấy danh sách
router.get('/', getNotifications);

// GET /api/notifications/unread - Đếm chưa đọc
router.get('/unread', getUnreadCount);

// PUT /api/notifications/read-all - Đánh dấu tất cả đã đọc
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read - Đánh dấu 1 cái đã đọc
router.put('/:id/read', markAsRead);

// DELETE /api/notifications/:id - Xóa
router.delete('/:id', deleteNotification);

export default router;
