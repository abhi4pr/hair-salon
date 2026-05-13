import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { globalLimiter } from './src/middlewares/rateLimiter.js';
import { morganMiddleware } from './src/config/logger.js';
import errorHandler from './errors/errorHandler.js';
import AppError from './errors/AppError.js';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import salonRoutes from './src/routes/salon.routes.js';
import staffRoutes from './src/routes/staff.routes.js';
import serviceRoutes from './src/routes/service.routes.js';
import appointmentRoutes from './src/routes/appointment.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import offerRoutes from './src/routes/offer.routes.js';
import loyaltyRoutes from './src/routes/loyalty.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import chatRoutes from './src/routes/chat.routes.js';
import reportRoutes from './src/routes/report.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(globalLimiter);
app.use(morganMiddleware);

app.get('/health', (req, res) => res.json({ success: true, message: 'Server is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);

app.all('*', (req, res, next) => next(new AppError(`Route ${req.originalUrl} not found`, 404)));

app.use(errorHandler);

export default app;
