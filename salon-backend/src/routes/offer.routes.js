import { Router } from 'express';
import * as c from '../controllers/offer.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/salon/:salonId', c.getSalonOffers);
router.post('/validate', verifyToken, c.validateCoupon);

router.use(verifyToken, requireRole('salon_owner'));
router.get('/', c.getMyOffers);
router.post('/', c.createOffer);
router.patch('/:id', c.updateOffer);
router.delete('/:id', c.deleteOffer);

export default router;
