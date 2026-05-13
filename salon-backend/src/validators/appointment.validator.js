import { body } from 'express-validator';

export const bookingValidator = [
  body('salonId').isMongoId().withMessage('Valid salon ID required'),
  body('services').isArray({ min: 1 }).withMessage('At least one service required'),
  body('services.*').isMongoId().withMessage('Invalid service ID'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('startTime must be HH:mm'),
  body('paymentMethod').optional().isIn(['cash', 'wallet', 'loyalty_points', 'partial']),
  body('staffId').optional().isMongoId(),
  body('couponCode').optional().isString(),
];
