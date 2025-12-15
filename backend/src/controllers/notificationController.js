// backend/src/controllers/notificationController.js
import * as notificationService from '../services/notificationService.js';

/**
 * GET /api/notifications
 * Lấy danh sách notifications của user hiện tại
 */
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, unreadOnly = false } = req.query;

        const result = await notificationService.getUserNotifications(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            unreadOnly: unreadOnly === 'true'
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Error in getNotifications:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách thông báo'
        });
    }
};

/**
 * GET /api/notifications/unread
 * Đếm số notification chưa đọc
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await notificationService.getUnreadCount(userId);

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error in getUnreadCount:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đếm thông báo'
        });
    }
};

/**
 * PUT /api/notifications/:id/read
 * Đánh dấu notification đã đọc
 */
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await notificationService.markAsRead(id, userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo'
            });
        }

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Error in markAsRead:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái'
        });
    }
};

/**
 * PUT /api/notifications/read-all
 * Đánh dấu tất cả đã đọc
 */
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await notificationService.markAllAsRead(userId);

        res.json({
            success: true,
            message: `Đã đánh dấu ${count} thông báo là đã đọc`,
            count
        });
    } catch (error) {
        console.error('Error in markAllAsRead:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật'
        });
    }
};

/**
 * DELETE /api/notifications/:id
 * Xóa notification
 */
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await notificationService.deleteNotification(id, userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa thông báo'
        });
    } catch (error) {
        console.error('Error in deleteNotification:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa thông báo'
        });
    }
};
