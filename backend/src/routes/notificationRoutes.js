
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import * as controller from '../controllers/notificationController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', controller.getUserNotifications);
router.put('/read-all', controller.markAllAsRead);
router.put('/:id/read', controller.markAsRead);
router.delete('/:id', controller.deleteNotification);

export default router;
