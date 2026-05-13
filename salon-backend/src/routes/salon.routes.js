const router = require('express').Router();
const c = require('../controllers/salon.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');
const { salonValidator } = require('../validators/salon.validator');
const validate = require('../middlewares/validate.middleware');

router.get('/search', c.searchSalons);
router.get('/:id', c.getSalonById);

router.use(verifyToken);
router.use(requireRole('salon_owner'));

router.post('/', salonValidator, validate, c.createSalon);
router.get('/my/salon', c.getMySalon);
router.patch('/my/salon', c.updateSalon);
router.patch('/my/salon/business-hours', c.updateBusinessHours);
router.patch('/my/salon/holidays', c.updateHolidays);
router.post('/my/salon/images', upload.array('images', 10), c.uploadSalonImages);
router.delete('/my/salon/images/:fileId', c.deleteSalonImage);
router.post('/my/salon/qr', upload.single('qr'), c.uploadQRImage);

module.exports = router;
