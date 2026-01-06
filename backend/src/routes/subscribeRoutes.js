import express from 'express';
import { subscribe } from '../controllers/subscribeController.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', generalLimiter, subscribe); // Áp dụng giới hạn tốc độ để ngăn chặn spam

export default router;
