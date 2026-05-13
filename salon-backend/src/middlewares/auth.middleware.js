const jwt = require('jsonwebtoken');
const AppError = require('../../errors/AppError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('+isDeleted');
  if (!user || user.isDeleted) throw new AppError('User not found or account deleted', 401);

  req.user = user;
  next();
});

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: insufficient permissions', 403));
  }
  next();
};

module.exports = { verifyToken, requireRole };
