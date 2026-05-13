const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const AppError = require('../../errors/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { generateOTP, otpExpiryTime } = require('../helpers/otp.helper');
const sendEmail = require('../utils/sendEmail');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

const otpEmailHtml = (otp) => `
  <h2>Your OTP Code</h2>
  <p>Use the code below to verify your account. It expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
  <h1 style="letter-spacing:8px">${otp}</h1>
`;

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, referralCode } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409);

  const otp = generateOTP();
  const referrer = referralCode ? await User.findOne({ referralCode }) : null;

  const user = await User.create({
    name,
    email,
    phone,
    role: role || 'customer',
    passwordHash: password,
    otp,
    otpExpiry: otpExpiryTime(),
    referralCode: uuidv4().substring(0, 8).toUpperCase(),
    referredBy: referrer?._id || null,
  });

  await sendEmail({
    to: email,
    subject: 'Verify your Salon App account',
    html: otpEmailHtml(otp),
  });

  success(res, 'Registration successful. Please verify your email with the OTP sent.', { userId: user._id }, 201);
});

exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpiry');
  if (!user) throw new AppError('User not found', 404);
  if (user.isVerified) throw new AppError('Account already verified', 400);
  if (user.otp !== otp) throw new AppError('Invalid OTP', 400);
  if (user.otpExpiry < new Date()) throw new AppError('OTP expired', 400);

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  success(res, 'Email verified successfully');
});

exports.resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpiry');
  if (!user) throw new AppError('User not found', 404);
  if (user.isVerified) throw new AppError('Account already verified', 400);

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = otpExpiryTime();
  await user.save();

  await sendEmail({ to: email, subject: 'Your new OTP', html: otpEmailHtml(otp) });

  success(res, 'OTP resent to your email');
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isDeleted: false }).select('+passwordHash +refreshToken');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isVerified) throw new AppError('Please verify your email first', 403);

  const accessToken = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  success(res, 'Login successful', {
    accessToken,
    refreshToken,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 401);

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) throw new AppError('Invalid refresh token', 401);

  const accessToken = signToken(user._id);
  success(res, 'Token refreshed', { accessToken });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+otp +otpExpiry');
  if (!user) throw new AppError('No account found with this email', 404);

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = otpExpiryTime();
  await user.save();

  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `<h2>Password Reset OTP</h2>${otpEmailHtml(otp)}`,
  });

  success(res, 'OTP sent to your email for password reset');
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email }).select('+otp +otpExpiry +passwordHash');
  if (!user) throw new AppError('User not found', 404);
  if (user.otp !== otp) throw new AppError('Invalid OTP', 400);
  if (user.otpExpiry < new Date()) throw new AppError('OTP expired', 400);

  user.passwordHash = newPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  success(res, 'Password reset successful');
});

exports.logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  success(res, 'Logged out successfully');
});
