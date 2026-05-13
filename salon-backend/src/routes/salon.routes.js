import { Router } from 'express';
import * as c from '../controllers/salon.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { salonValidator } from '../validators/salon.validator.js';
import validate from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/search', c.searchSalons);
router.get('/:id', c.getSalonById);

router.use(verifyToken, requireRole('salon_owner'));
router.post('/', salonValidator, validate, c.createSalon);
router.get('/my/salon', c.getMySalon);
router.patch('/my/salon', c.updateSalon);
router.patch('/my/salon/business-hours', c.updateBusinessHours);
router.patch('/my/salon/holidays', c.updateHolidays);
router.post('/my/salon/images', upload.array('images', 10), c.uploadSalonImages);
router.delete('/my/salon/images/:fileId', c.deleteSalonImage);
router.post('/my/salon/qr', upload.single('qr'), c.uploadQRImage);

export default router;
