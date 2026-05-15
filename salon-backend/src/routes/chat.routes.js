import { Router } from 'express';
import * as c from '../controllers/chat.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyToken);

router.post('/messages', c.sendMessage);
router.get('/messages/:salonId', c.getConversation);
router.get('/my-conversations', c.getMyConversations);
router.get('/conversations', requireRole('salon_owner'), c.getSalonConversations);

router.post('/tickets', c.createTicket);
router.get('/tickets', c.getMyTickets);
router.post('/tickets/:id/reply', c.replyToTicket);

export default router;
