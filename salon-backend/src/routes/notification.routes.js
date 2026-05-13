const router = require('express').Router();
const c = require('../controllers/notification.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', c.getMyNotifications);
router.get('/unread-count', c.getUnreadCount);
router.patch('/read-all', c.markAllRead);
router.patch('/:id/read', c.markAsRead);

module.exports = router;
