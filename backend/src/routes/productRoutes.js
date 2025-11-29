import express from 'express'
import {
    getLatestProducts,
    getBestSellers,
    getMostViewed,
    getTopDiscounts,
    getProductById,
    incrementView,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js'

const router = express.Router()

// Public routes - không cần authentication
router.get('/latest', getLatestProducts)
router.get('/best-sellers', getBestSellers)
router.get('/most-viewed', getMostViewed)
router.get('/top-discounts', getTopDiscounts)

// Product detail routes
router.get('/:id', getProductById)
router.post('/:id/view', incrementView)

// Admin routes - TODO: Thêm authMiddleware và check admin role
router.post('/', createProduct)           // CREATE
router.put('/:id', updateProduct)         // UPDATE
router.delete('/:id', deleteProduct)      // DELETE

export default router
