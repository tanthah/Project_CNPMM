// frontend/src/api/wishlistApi.js - ENHANCED
import axios from './axios';

const wishlistApi = {
    // Get wishlist
    getWishlist: () => axios.get('/wishlist'),
    
    // Add to wishlist
    addToWishlist: (productId) => axios.post('/wishlist/add', { productId }),
    
    // Remove from wishlist
    removeFromWishlist: (productId) => axios.delete(`/wishlist/remove/${productId}`),
    
    // Check if product in wishlist
    checkWishlist: (productId) => axios.get(`/wishlist/check/${productId}`),
    
    // ✅ NEW: Check multiple products
    checkMultipleWishlist: (productIds) => 
        axios.post('/wishlist/check-multiple', { productIds }),

    // ✅ NEW: Clear entire wishlist
    clearWishlist: () => axios.delete('/wishlist/clear'),
};

export default wishlistApi;
