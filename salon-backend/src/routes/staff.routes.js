import { Router } from 'express';
import * as c from '../controllers/staff.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/salon/:salonId', c.getStaffBySalon);

router.use(verifyToken, requireRole('salon_owner'));
router.get('/', c.getStaff);
router.post('/', c.createStaff);
router.patch('/:id', upload.single('avatar'), c.updateStaff);
router.delete('/:id', c.deleteStaff);

export default router;
