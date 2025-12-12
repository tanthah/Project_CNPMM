// frontend/src/api/reviewApi.js
import axios from './axios';

const reviewApi = {
    // Create review
    createReview: (data) => axios.post('/reviews/create', data),
    
    // Get pending reviews (products to review)
    getPendingReviews: () => axios.get('/reviews/pending'),
    
    // Get user reviews
    getUserReviews: (page = 1, limit = 10) => 
        axios.get('/reviews/user', { params: { page, limit } }),
    
    // Get product reviews
    getProductReviews: (productId, page = 1, limit = 10, sort = 'newest') =>
        axios.get(`/reviews/product/${productId}`, { params: { page, limit, sort } }),
    
    // Update review
    updateReview: (reviewId, data) => axios.put(`/reviews/${reviewId}`, data),
    
    // Delete review
    deleteReview: (reviewId) => axios.delete(`/reviews/${reviewId}`),
};

export default reviewApi;