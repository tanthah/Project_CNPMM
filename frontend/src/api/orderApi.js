// frontend/src/api/orderApi.js - ENHANCED
import axiosClient from './axios'

const orderApi = {
    // Create order
    createOrder: (data) => {
        return axiosClient.post('/orders/create', data)
    },

    // Get all user orders (with optional status filter)
    getUserOrders: (status) => {
        const params = status ? { status } : {};
        return axiosClient.get('/orders', { params })
    },
    // ADMIN: Get all orders
    getAdminOrders: (status, search) => {
        const params = {};
        if (status) params.status = status;
        if (search) params.search = search;
        return axiosClient.get('/admin/orders', { params })
    },

    // Get order detail
    getOrderDetail: (orderId) => {
        return axiosClient.get(`/orders/${orderId}`)
    },

    // Get order status history
    getOrderStatusHistory: (orderId) => {
        return axiosClient.get(`/orders/${orderId}/history`)
    },

    // Get order statistics
    getOrderStatistics: () => {
        return axiosClient.get('/orders/statistics')
    },

    // Cancel order (both direct cancel and request cancel)
    cancelOrder: (orderId, cancelReason) => {
        return axiosClient.put(`/orders/${orderId}/cancel`, { cancelReason })
    },

    // ADMIN: Update order status
    updateOrderStatusAdmin: (orderId, status, note) => {
        return axiosClient.put(`/admin/orders/${orderId}/status`, { status, note })
    },

    // ADMIN: Handle cancel request
    handleCancelRequestAdmin: (orderId, action, rejectionReason) => {
        return axiosClient.put(`/admin/orders/${orderId}/cancel-request`, { 
            action, 
            rejectionReason 
        })
    }
}

export default orderApi
