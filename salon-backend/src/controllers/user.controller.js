import User from '../models/User.js';
import AppError from '../../errors/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { uploadToImageKit, deleteFromImageKit } from '../middlewares/upload.middleware.js';

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favoriteSalons', 'name averageRating location');
  success(res, 'Profile fetched', user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, dob, gender, fcmToken } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (dob !== undefined) updates.dob = dob;
  if (gender !== undefined) updates.gender = gender;
  if (fcmToken) updates.fcmToken = fcmToken;

  if (req.file) {
    const user = await User.findById(req.user._id);
    if (user.avatarFileId) await deleteFromImageKit(user.avatarFileId);
    const { url, fileId } = await uploadToImageKit(req.file, 'avatars');
    updates.avatar = url;
    updates.avatarFileId = fileId;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  success(res, 'Profile updated', user);
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isDeleted: true, deletedAt: new Date() });
  success(res, 'Account deleted successfully');
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  success(res, 'Address added', user.addresses);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) throw new AppError('Address not found', 404);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(addr, req.body);
  await user.save();
  success(res, 'Address updated', user.addresses);
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  success(res, 'Address deleted', user.addresses);
});

export const toggleFavoriteSalon = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const salonId = req.params.salonId;
  const idx = user.favoriteSalons.findIndex((s) => s.toString() === salonId);
  if (idx > -1) {
    user.favoriteSalons.splice(idx, 1);
  } else {
    user.favoriteSalons.push(salonId);
  }
  await user.save();
  success(res, idx > -1 ? 'Removed from favorites' : 'Added to favorites');
});

export const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favoriteSalons');
  success(res, 'Favorite salons fetched', user.favoriteSalons);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await user.matchPassword(oldPassword))) throw new AppError('Incorrect current password', 400);
  user.passwordHash = newPassword;
  await user.save();
  success(res, 'Password changed successfully');
});
