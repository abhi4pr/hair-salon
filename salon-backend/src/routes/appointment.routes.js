import { Router } from 'express';
import * as c from '../controllers/appointment.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { bookingValidator } from '../validators/appointment.validator.js';
import validate from '../middlewares/validate.middleware.js';

const router = Router();
router.use(verifyToken);

router.get('/salons/:salonId/slots', c.getAvailableSlots);
router.post('/', bookingValidator, validate, c.createAppointment);
router.get('/my', c.getMyAppointments);
router.get('/salon', requireRole('salon_owner'), c.getSalonAppointments);
router.get('/:id', c.getAppointmentById);
router.patch('/:id/cancel', c.cancelAppointment);
router.patch('/:id/reschedule', c.rescheduleAppointment);
router.patch('/:id/status', requireRole('salon_owner'), c.updateAppointmentStatus);
router.post('/:id/waiting-list', c.addToWaitingList);

export default router;
