import { Router } from 'express';
import * as c from '../controllers/review.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { reviewValidator } from '../validators/review.validator.js';
import validate from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/salon/:salonId', c.getSalonReviews);

router.use(verifyToken);
router.post('/', upload.array('images', 5), reviewValidator, validate, c.createReview);
router.post('/:id/report', c.reportReview);
router.post('/:id/reply', requireRole('salon_owner'), c.replyToReview);
router.patch('/:id/moderate', requireRole('salon_owner'), c.moderateReview);

export default router;
