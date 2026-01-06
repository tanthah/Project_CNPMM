import express from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { createComment, getProductComments, deleteComment, toggleLike } from '../controllers/commentController.js'

const router = express.Router()

router.get('/product/:productId', getProductComments)
router.use(authenticateToken)
router.post('/create', createComment)
router.put('/:commentId/like', toggleLike)
router.delete('/:commentId', deleteComment)

export default router

