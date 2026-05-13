const router = require('express').Router();
const c = require('../controllers/offer.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/salon/:salonId', c.getSalonOffers);
router.post('/validate', verifyToken, c.validateCoupon);

router.use(verifyToken, requireRole('salon_owner'));
router.get('/', c.getMyOffers);
router.post('/', c.createOffer);
router.patch('/:id', c.updateOffer);
router.delete('/:id', c.deleteOffer);

module.exports = router;
