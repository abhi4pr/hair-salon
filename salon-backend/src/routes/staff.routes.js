const router = require('express').Router();
const c = require('../controllers/staff.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

router.get('/salon/:salonId', c.getStaffBySalon);

router.use(verifyToken, requireRole('salon_owner'));
router.get('/', c.getStaff);
router.post('/', c.createStaff);
router.patch('/:id', upload.single('avatar'), c.updateStaff);
router.delete('/:id', c.deleteStaff);

module.exports = router;
