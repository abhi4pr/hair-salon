import { Router } from 'express';
import * as c from '../controllers/payment.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyToken);

router.get('/qr/:salonId', c.getQRCode);
router.get('/history', c.getPaymentHistory);
router.post('/:id/confirm-cash', requireRole('salon_owner'), c.confirmCashPayment);
router.patch('/:id/tip', requireRole('salon_owner'), c.addTip);

export default router;
