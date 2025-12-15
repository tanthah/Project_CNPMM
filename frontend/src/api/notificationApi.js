// frontend/src/api/notificationApi.js
import axios from './axios';

export const getNotifications = async (page = 1, limit = 10, unreadOnly = false) => {
    const response = await axios.get('/notifications', {
        params: { page, limit, unreadOnly }
    });
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await axios.get('/notifications/unread');
    return response.data;
};

export const markAsRead = async (notificationId) => {
    const response = await axios.put(`/notifications/${notificationId}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await axios.put('/notifications/read-all');
    return response.data;
};

export const deleteNotification = async (notificationId) => {
    const response = await axios.delete(`/notifications/${notificationId}`);
    return response.data;
};
