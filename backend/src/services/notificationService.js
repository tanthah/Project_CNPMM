// backend/src/services/notificationService.js
import Notification from '../models/Notification.js';
import { emitToUser } from '../sockets/socketHandler.js';

/**
 * Tạo notification mới và emit qua socket
 */
export const createNotification = async ({
    userId,
    type,
    title,
    message,
    link = '',
    referenceId = null,
    referenceType = null,
    metadata = {}
}) => {
    try {
        // Tạo notification trong DB
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            link,
            referenceId,
            referenceType,
            metadata
        });

        // Emit realtime notification qua socket
        emitToUser(userId, 'new_notification', {
            _id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            link: notification.link,
            createdAt: notification.createdAt,
            isRead: false
        });

        console.log(`✅ Notification created for user ${userId}: ${title}`);

        return notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        throw error;
    }
};

/**
 * Lấy danh sách notifications của user
 */
export const getUserNotifications = async (userId, { page = 1, limit = 10, unreadOnly = false }) => {
    try {
        const query = { userId };
        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);

        return {
            notifications,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('❌ Error getting notifications:', error);
        throw error;
    }
};

/**
 * Đếm số notification chưa đọc
 */
export const getUnreadCount = async (userId) => {
    try {
        const count = await Notification.countDocuments({ userId, isRead: false });
        return count;
    } catch (error) {
        console.error('❌ Error counting unread notifications:', error);
        throw error;
    }
};

/**
 * Đánh dấu notification đã đọc
 */
export const markAsRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true },
            { new: true }
        );
        return notification;
    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Đánh dấu tất cả notifications đã đọc
 */
export const markAllAsRead = async (userId) => {
    try {
        const result = await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        return result.modifiedCount;
    } catch (error) {
        console.error('❌ Error marking all as read:', error);
        throw error;
    }
};

/**
 * Xóa notification
 */
export const deleteNotification = async (notificationId, userId) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            userId
        });
        return notification;
    } catch (error) {
        console.error('❌ Error deleting notification:', error);
        throw error;
    }
};
