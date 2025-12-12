// frontend/src/api/viewedProductApi.js - FIXED
// ========================================
import axios from './axios';

const viewedProductApi = {
    // Track product view
    trackView: (productId) => axios.post('/viewed/track', { productId }),
    
    // Get viewed products
    getViewedProducts: (limit = 20) => 
        axios.get('/viewed', { params: { limit } }),
    
    // Clear viewed history
    clearViewedHistory: () => axios.delete('/viewed/clear'),

    // ✅ Remove single viewed product
    removeFromViewed: (productId) => axios.delete(`/viewed/remove/${productId}`),
};

export default viewedProductApi;
