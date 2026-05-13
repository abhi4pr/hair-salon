const router = require('express').Router();
const c = require('../controllers/report.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.use(verifyToken, requireRole('salon_owner'));

router.get('/revenue', c.getRevenueReport);
router.get('/bookings', c.getBookingStats);
router.get('/peak-hours', c.getPeakHours);
router.get('/staff', c.getStaffPerformance);
router.get('/services', c.getServicePopularity);
router.get('/cancellations', c.getCancellationReport);
router.get('/tax', c.getTaxReport);

module.exports = router;
