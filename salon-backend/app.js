require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { globalLimiter } = require('./src/middlewares/rateLimiter');
const errorHandler = require('./errors/errorHandler');
const AppError = require('./errors/AppError');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(globalLimiter);

app.get('/health', (req, res) => res.json({ success: true, message: 'Server is running' }));

app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/salons', require('./src/routes/salon.routes'));
app.use('/api/staff', require('./src/routes/staff.routes'));
app.use('/api/services', require('./src/routes/service.routes'));
app.use('/api/appointments', require('./src/routes/appointment.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));
app.use('/api/reviews', require('./src/routes/review.routes'));
app.use('/api/offers', require('./src/routes/offer.routes'));
app.use('/api/loyalty', require('./src/routes/loyalty.routes'));
app.use('/api/notifications', require('./src/routes/notification.routes'));
app.use('/api/chat', require('./src/routes/chat.routes'));
app.use('/api/reports', require('./src/routes/report.routes'));

app.all('*', (req, res, next) => next(new AppError(`Route ${req.originalUrl} not found`, 404)));

app.use(errorHandler);

module.exports = app;
