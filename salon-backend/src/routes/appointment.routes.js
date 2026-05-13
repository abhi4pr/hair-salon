const router = require('express').Router();
const c = require('../controllers/appointment.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { bookingValidator } = require('../validators/appointment.validator');
const validate = require('../middlewares/validate.middleware');

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

module.exports = router;
