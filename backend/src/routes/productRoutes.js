// backend/src/routes/productRoutes.js - ENHANCED
import express from 'express'
import {
    getAllProducts,
    getAllProductsWithPagination,
    searchProducts,
    fuzzySearchProducts,
    suggestProducts,
    getProductDetail,
    getProductDetailEnhanced,
    getBestSellingProducts,
    getNewestProducts,
    getMostViewedProducts,
    getHighestDiscountProducts,
    getSimilarProducts,
    getProductStats,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js'

const router = express.Router()

// Public routes
router.get('/', getAllProducts)
router.get('/paginated', getAllProductsWithPagination)
router.get('/search', searchProducts)
router.get('/search/fuzzy', fuzzySearchProducts)
router.get('/search/suggest', suggestProducts)
router.get('/best-selling', getBestSellingProducts)
router.get('/newest', getNewestProducts)
router.get('/most-viewed', getMostViewedProducts)
router.get('/highest-discount', getHighestDiscountProducts)

// ✅ NEW ROUTES
router.get('/:id/similar', getSimilarProducts) // Sản phẩm tương tự
router.get('/:id/stats', getProductStats) // Thống kê sản phẩm
router.get('/:id/enhanced', getProductDetailEnhanced) // Chi tiết + stats

// Product detail (keep existing)
router.get('/:id', getProductDetail)

// Admin routes - TODO: Add authentication middleware
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router
