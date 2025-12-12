// frontend/src/api/couponApi.js - FIXED
// ========================================
import axios from './axios';

const couponApi = {
    // Get user coupons
    getUserCoupons: (status = 'active') => 
        axios.get('/coupons/user', { params: { status } }),
    
    // Validate coupon
    validateCoupon: (code, orderValue) =>
        axios.post('/coupons/validate', { code, orderValue }),
    
    // Admin: Create coupon
    createCoupon: (data) => axios.post('/coupons/create', data),
    
    // Admin: Get all coupons
    getAllCoupons: (page = 1, limit = 20) =>
        axios.get('/coupons/all', { params: { page, limit } }),
    
    // Admin: Update coupon
    updateCoupon: (couponId, data) => axios.put(`/coupons/${couponId}`, data),
    
    // Admin: Delete coupon
    deleteCoupon: (couponId) => axios.delete(`/coupons/${couponId}`),
};

export default couponApi;