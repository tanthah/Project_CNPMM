// frontend/src/api/productApi.js - ENHANCED
import axiosClient from './axios'

const productApi = {
    getAll: () => {
        return axiosClient.get('/products')
    },
    
    getPaginated: (page = 1, limit = 16, sort = 'newest', filters = {}) => {
        return axiosClient.get('/products/paginated', {
            params: { page, limit, sort, ...filters }
        })
    },
    
    getDetail: (id) => {
        return axiosClient.get(`/products/${id}`)
    },
    
    // ✅ NEW: Get enhanced detail with stats
    getDetailEnhanced: (id) => {
        return axiosClient.get(`/products/${id}/enhanced`)
    },
    
    // ✅ NEW: Get similar products
    getSimilarProducts: (id, limit = 8) => {
        return axiosClient.get(`/products/${id}/similar`, {
            params: { limit }
        })
    },
    
    // ✅ NEW: Get product stats
    getProductStats: (id) => {
        return axiosClient.get(`/products/${id}/stats`)
    },

    searchFuzzy: (query, page = 1, limit = 16) => {
        return axiosClient.get('/products/search/fuzzy', {
            params: { query, page, limit }
        })
    },

    suggest: (query, limit = 8) => {
        return axiosClient.get('/products/search/suggest', {
            params: { query, limit }
        })
    },
    
    getBestSelling: () => {
        return axiosClient.get('/products/best-selling')
    },
    
    getNewest: () => {
        return axiosClient.get('/products/newest')
    },
    
    getMostViewed: () => {
        return axiosClient.get('/products/most-viewed')
    },
    
    getHighestDiscount: () => {
        return axiosClient.get('/products/highest-discount')
    }
}

export default productApi
