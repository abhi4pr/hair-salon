const { body } = require('express-validator');

const salonValidator = [
  body('name').trim().notEmpty().withMessage('Salon name is required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('slotDuration').optional().isInt({ min: 15 }).withMessage('Slot duration must be at least 15 minutes'),
  body('bufferTime').optional().isInt({ min: 0 }),
  body('category').optional().isIn(['unisex', 'mens', 'womens', 'kids']),
];

const serviceValidator = [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('duration').isInt({ min: 5 }).withMessage('Duration must be at least 5 minutes'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('discountPrice').optional().isFloat({ min: 0 }),
];

module.exports = { salonValidator, serviceValidator };
