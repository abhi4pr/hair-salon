const router = require('express').Router();
const c = require('../controllers/chat.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.post('/messages', c.sendMessage);
router.get('/messages/:salonId', c.getConversation);
router.get('/conversations', requireRole('salon_owner'), c.getSalonConversations);

router.post('/tickets', c.createTicket);
router.get('/tickets', c.getMyTickets);
router.post('/tickets/:id/reply', c.replyToTicket);

module.exports = router;
