const router = require('express').Router();
const c = require('../controllers/service.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');
const { serviceValidator } = require('../validators/salon.validator');
const validate = require('../middlewares/validate.middleware');

router.get('/salon/:salonId', c.getServicesBySalon);

router.use(verifyToken, requireRole('salon_owner'));
router.get('/', c.getMyServices);
router.post('/', upload.single('image'), serviceValidator, validate, c.createService);
router.patch('/:id', upload.single('image'), c.updateService);
router.delete('/:id', c.deleteService);

module.exports = router;
