
import axiosClient from './axios';

const notificationApi = {
    getAll: (page = 1) => {
        return axiosClient.get(`/notifications?page=${page}`);
    },
    markAsRead: (id) => {
        return axiosClient.put(`/notifications/${id}/read`);
    },
    markAllAsRead: () => {
        return axiosClient.put('/notifications/read-all', {}, {
            headers: { 'Content-Type': 'application/json' }
        });
    },
    delete: (id) => {
        return axiosClient.delete(`/notifications/${id}`);
    }
};

export default notificationApi;
