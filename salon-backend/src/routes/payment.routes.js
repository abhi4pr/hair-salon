const router = require('express').Router();
const c = require('../controllers/payment.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/qr/:salonId', c.getQRCode);
router.get('/history', c.getPaymentHistory);
router.post('/:id/confirm-cash', requireRole('salon_owner'), c.confirmCashPayment);
router.patch('/:id/tip', requireRole('salon_owner'), c.addTip);

module.exports = router;
