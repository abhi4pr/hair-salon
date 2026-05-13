import { Router } from 'express';
import * as c from '../controllers/notification.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyToken);

router.get('/', c.getMyNotifications);
router.get('/unread-count', c.getUnreadCount);
router.patch('/read-all', c.markAllRead);
router.patch('/:id/read', c.markAsRead);

export default router;
