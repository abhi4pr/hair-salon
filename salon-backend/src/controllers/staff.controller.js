const Staff = require('../models/Staff');
const Salon = require('../models/Salon');
const AppError = require('../../errors/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { uploadToImageKit, deleteFromImageKit } = require('../middlewares/upload.middleware');

const getSalonForOwner = async (ownerId) => {
  const salon = await Salon.findOne({ owner: ownerId });
  if (!salon) throw new AppError('Salon not found', 404);
  return salon;
};

exports.createStaff = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const staff = await Staff.create({ ...req.body, salon: salon._id });
  success(res, 'Staff created', staff, 201);
});

exports.getStaff = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const staff = await Staff.find({ salon: salon._id }).populate('services', 'name duration price');
  success(res, 'Staff list fetched', staff);
});

exports.getStaffBySalon = asyncHandler(async (req, res) => {
  const staff = await Staff.find({ salon: req.params.salonId, isActive: true }).populate('services', 'name duration');
  success(res, 'Staff fetched', staff);
});

exports.updateStaff = asyncHandler(async (req, res) => {
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

exports.deleteStaff = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const staff = await Staff.findOne({ _id: req.params.id, salon: salon._id });
  if (!staff) throw new AppError('Staff not found', 404);
  staff.isActive = false;
  await staff.save();
  success(res, 'Staff deactivated');
});
