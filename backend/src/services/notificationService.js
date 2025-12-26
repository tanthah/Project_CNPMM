
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { emitToUser } from '../sockets/socketHandler.js';

// 1. Create & Emit
export const createNotification = async ({ userId, title, message, type = 'system', link = '' }) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            link
        });

        // Emit real-time
        emitToUser(userId, 'new_notification', notification);

        return notification;
    } catch (error) {
        console.error('Create Notif Error:', error.message);
    }
};

// 2. Get List (Simple pagination)
export const getUserNotifications = async (userId, page = 1) => {
    const limit = 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return { notifications, total, unreadCount };
};

// 3. Mark One as Read
export const markAsRead = async (id, userId) => {
    return await Notification.findOneAndUpdate(
        { _id: id, userId },
        { isRead: true },
        { new: true }
    );
};

// 4. Mark All as Read
export const markAllAsRead = async (userId) => {
    // Explicitly cast to ObjectId to ensure updates work
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await Notification.updateMany(
        { userId: userObjectId, isRead: false },
        { isRead: true }
    );

    return result;
};

// 5. Delete
export const deleteNotification = async (id, userId) => {
    return await Notification.findOneAndDelete({ _id: id, userId });
};
