import { Router } from 'express';
import * as c from '../controllers/report.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyToken, requireRole('salon_owner'));

router.get('/revenue', c.getRevenueReport);
router.get('/bookings', c.getBookingStats);
router.get('/peak-hours', c.getPeakHours);
router.get('/staff', c.getStaffPerformance);
router.get('/services', c.getServicePopularity);
router.get('/cancellations', c.getCancellationReport);
router.get('/tax', c.getTaxReport);

export default router;
