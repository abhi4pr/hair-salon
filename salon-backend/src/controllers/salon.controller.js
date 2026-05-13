const Salon = require('../models/Salon');
const AppError = require('../../errors/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const paginate = require('../utils/paginate');
const { uploadToImageKit, deleteFromImageKit } = require('../middlewares/upload.middleware');

exports.createSalon = asyncHandler(async (req, res) => {
  const existing = await Salon.findOne({ owner: req.user._id });
  if (existing) throw new AppError('You already have a registered salon', 409);

  const salon = await Salon.create({ ...req.body, owner: req.user._id });
  success(res, 'Salon created successfully', salon, 201);
});

exports.getMySalon = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('No salon found', 404);
  success(res, 'Salon fetched', salon);
});

exports.updateSalon = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);

  const allowed = ['name', 'description', 'category', 'slotDuration', 'bufferTime', 'bookingApprovalRequired', 'location', 'chairs'];
  allowed.forEach((field) => { if (req.body[field] !== undefined) salon[field] = req.body[field]; });
  await salon.save();
  success(res, 'Salon updated', salon);
});

exports.getSalonById = asyncHandler(async (req, res) => {
  const salon = await Salon.findById(req.params.id).populate('owner', 'name email phone');
  if (!salon || !salon.isActive) throw new AppError('Salon not found', 404);
  success(res, 'Salon fetched', salon);
});

exports.searchSalons = asyncHandler(async (req, res) => {
  const { q, city, category, minRating, maxPrice, lat, lng, radius = 10000 } = req.query;

  const query = { isActive: true, isApproved: true };
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (category) query.category = category;
  if (minRating) query.averageRating = { $gte: parseFloat(minRating) };

  let mongoQuery;
  if (lat && lng) {
    mongoQuery = Salon.find({
      ...query,
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius),
        },
      },
    });
  } else if (q) {
    mongoQuery = Salon.find({ ...query, $text: { $search: q } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } });
  } else {
    mongoQuery = Salon.find(query).sort({ averageRating: -1 });
  }

  const { data, pagination } = await paginate(Salon, query, { page: req.query.page, limit: req.query.limit });
  success(res, 'Salons fetched', data, 200, pagination);
});

exports.uploadSalonImages = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);
  if (!req.files?.length) throw new AppError('No files uploaded', 400);

  const uploads = await Promise.all(req.files.map((f) => uploadToImageKit(f, 'salon-images')));
  salon.images.push(...uploads);
  await salon.save();
  success(res, 'Images uploaded', salon.images);
});

exports.deleteSalonImage = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);

  const img = salon.images.find((i) => i.fileId === req.params.fileId);
  if (!img) throw new AppError('Image not found', 404);

  await deleteFromImageKit(img.fileId);
  salon.images = salon.images.filter((i) => i.fileId !== req.params.fileId);
  await salon.save();
  success(res, 'Image deleted');
});

exports.uploadQRImage = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);
  if (!req.file) throw new AppError('QR image required', 400);

  if (salon.qrImageFileId) await deleteFromImageKit(salon.qrImageFileId);
  const { url, fileId } = await uploadToImageKit(req.file, 'qr-images');
  salon.qrImage = url;
  salon.qrImageFileId = fileId;
  await salon.save();
  success(res, 'QR image uploaded', { qrImage: salon.qrImage });
});

exports.updateBusinessHours = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);
  salon.businessHours = req.body.businessHours;
  await salon.save();
  success(res, 'Business hours updated', salon.businessHours);
});

exports.updateHolidays = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);
  salon.holidays = req.body.holidays;
  await salon.save();
  success(res, 'Holidays updated', salon.holidays);
});
