import { Router } from 'express';
import * as c from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { authLimiter, otpLimiter } from '../middlewares/rateLimiter.js';
import {
  registerValidator, loginValidator, otpValidator,
  forgotPasswordValidator, resetPasswordValidator,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, validate, c.register);
router.post('/verify-otp', otpValidator, validate, c.verifyOTP);
router.post('/resend-otp', otpLimiter, forgotPasswordValidator, validate, c.resendOTP);
router.post('/login', authLimiter, loginValidator, validate, c.login);
router.post('/refresh-token', c.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, c.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, c.resetPassword);
router.delete('/logout', verifyToken, c.logout);

export default router;
