import jwt from 'jsonwebtoken';
import AppError from '../../errors/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

export const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new AppError('No token provided', 401);

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('+isDeleted');
  if (!user || user.isDeleted) throw new AppError('User not found or account deleted', 401);

  req.user = user;
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: insufficient permissions', 403));
  }
  next();
};
