const router = require('express').Router();
const c = require('../controllers/loyalty.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/balance', c.getMyLoyaltyBalance);
router.get('/history', c.getLoyaltyHistory);
router.get('/memberships', c.getMyMemberships);
router.post('/memberships/purchase', c.purchaseMembership);

router.get('/plans', c.getMembershipPlans);
router.get('/plans/:salonId', c.getMembershipPlans);
router.post('/plans', requireRole('salon_owner'), c.createMembershipPlan);

module.exports = router;
