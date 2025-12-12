// backend/src/routes/loyaltyRoutes.js
// ========================================
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getLoyaltyPoints,
  getPointsHistory
} from '../controllers/loyaltyController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getLoyaltyPoints);
router.get('/history', getPointsHistory);

export default router;