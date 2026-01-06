
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

// Route công khai
router.get('/', getAllProducts)
router.get('/paginated', getAllProductsWithPagination)
router.get('/search', searchProducts)
router.get('/search/fuzzy', fuzzySearchProducts)
router.get('/search/suggest', suggestProducts)
router.get('/best-selling', getBestSellingProducts)
router.get('/newest', getNewestProducts)
router.get('/most-viewed', getMostViewedProducts)
router.get('/highest-discount', getHighestDiscountProducts)

// ✅ ROUTE MỚI
router.get('/:id/similar', getSimilarProducts) // Sản phẩm tương tự
router.get('/:id/stats', getProductStats) // Thống kê sản phẩm
router.get('/:id/enhanced', getProductDetailEnhanced) // Chi tiết + stats

// Chi tiết sản phẩm (giữ nguyên hiện tại)
router.get('/:id', getProductDetail)

// Route Admin - TODO: Thêm middleware xác thực
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router
