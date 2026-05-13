const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { authLimiter, otpLimiter } = require('../middlewares/rateLimiter');
const {
  registerValidator, loginValidator, otpValidator,
  forgotPasswordValidator, resetPasswordValidator,
} = require('../validators/auth.validator');

router.post('/register', authLimiter, registerValidator, validate, c.register);
router.post('/verify-otp', otpValidator, validate, c.verifyOTP);
router.post('/resend-otp', otpLimiter, forgotPasswordValidator, validate, c.resendOTP);
router.post('/login', authLimiter, loginValidator, validate, c.login);
router.post('/refresh-token', c.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, c.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, c.resetPassword);
router.delete('/logout', verifyToken, c.logout);

module.exports = router;
