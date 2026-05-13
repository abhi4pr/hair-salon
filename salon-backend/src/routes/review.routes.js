const router = require('express').Router();
const c = require('../controllers/review.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');
const { reviewValidator } = require('../validators/review.validator');
const validate = require('../middlewares/validate.middleware');

router.get('/salon/:salonId', c.getSalonReviews);

router.use(verifyToken);
router.post('/', upload.array('images', 5), reviewValidator, validate, c.createReview);
router.post('/:id/report', c.reportReview);
router.post('/:id/reply', requireRole('salon_owner'), c.replyToReview);
router.patch('/:id/moderate', requireRole('salon_owner'), c.moderateReview);

module.exports = router;
