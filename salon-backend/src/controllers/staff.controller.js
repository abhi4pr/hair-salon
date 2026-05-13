import Staff from '../models/Staff.js';
import Salon from '../models/Salon.js';
import AppError from '../../errors/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { uploadToImageKit, deleteFromImageKit } from '../middlewares/upload.middleware.js';

const getSalonForOwner = async (ownerId) => {
  const salon = await Salon.findOne({ owner: ownerId });
  if (!salon) throw new AppError('Salon not found', 404);
  return salon;
};

export const createStaff = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const staff = await Staff.create({ ...req.body, salon: salon._id });
  success(res, 'Staff created', staff, 201);
});

export const getStaff = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const staff = await Staff.find({ salon: salon._id }).populate('services', 'name duration price');
  success(res, 'Staff list fetched', staff);
});

export const getStaffBySalon = asyncHandler(async (req, res) => {
  const staff = await Staff.find({ salon: req.params.salonId, isActive: true }).populate('services', 'name duration');
  success(res, 'Staff fetched', staff);
});

export const updateStaff = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const staff = await Staff.findOne({ _id: req.params.id, salon: salon._id });
  if (!staff) throw new AppError('Staff not found', 404);

  if (req.file) {
    if (staff.avatarFileId) await deleteFromImageKit(staff.avatarFileId);
    const { url, fileId } = await uploadToImageKit(req.file, 'staff-avatars');
    req.body.avatar = url;
    req.body.avatarFileId = fileId;
  }

  Object.assign(staff, req.body);
  await staff.save();
  success(res, 'Staff updated', staff);
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const staff = await Staff.findOne({ _id: req.params.id, salon: salon._id });
  if (!staff) throw new AppError('Staff not found', 404);
  staff.isActive = false;
  await staff.save();
  success(res, 'Staff deactivated');
});
