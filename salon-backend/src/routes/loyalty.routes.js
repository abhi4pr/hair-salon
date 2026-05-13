import { Router } from 'express';
import * as c from '../controllers/loyalty.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyToken);

router.get('/balance', c.getMyLoyaltyBalance);
router.get('/history', c.getLoyaltyHistory);
router.get('/memberships', c.getMyMemberships);
router.post('/memberships/purchase', c.purchaseMembership);
router.get('/plans', c.getMembershipPlans);
router.get('/plans/:salonId', c.getMembershipPlans);
router.post('/plans', requireRole('salon_owner'), c.createMembershipPlan);

export default router;
