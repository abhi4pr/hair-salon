import { Router } from 'express';
import * as c from '../controllers/service.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { serviceValidator } from '../validators/salon.validator.js';
import validate from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/salon/:salonId', c.getServicesBySalon);

router.use(verifyToken, requireRole('salon_owner'));
router.get('/', c.getMyServices);
router.post('/', upload.single('image'), serviceValidator, validate, c.createService);
router.patch('/:id', upload.single('image'), c.updateService);
router.delete('/:id', c.deleteService);

export default router;
