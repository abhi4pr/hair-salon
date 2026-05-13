import { body } from 'express-validator';

export const reviewValidator = [
  body('appointmentId').isMongoId().withMessage('Valid appointment ID required'),
  body('salonRating').isInt({ min: 1, max: 5 }).withMessage('Salon rating must be 1-5'),
  body('staffRating').optional().isInt({ min: 1, max: 5 }),
  body('serviceRating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().isString().isLength({ max: 1000 }),
];
