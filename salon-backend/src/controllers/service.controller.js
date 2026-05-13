const Service = require('../models/Service');
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

exports.createService = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  if (req.file) {
    const { url, fileId } = await uploadToImageKit(req.file, 'service-images');
    req.body.image = url;
    req.body.imageFileId = fileId;
  }
  const service = await Service.create({ ...req.body, salon: salon._id });
  success(res, 'Service created', service, 201);
});

exports.getServicesBySalon = asyncHandler(async (req, res) => {
  const services = await Service.find({ salon: req.params.salonId, isActive: true });
  success(res, 'Services fetched', services);
});

exports.getMyServices = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const services = await Service.find({ salon: salon._id });
  success(res, 'Services fetched', services);
});

exports.updateService = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const service = await Service.findOne({ _id: req.params.id, salon: salon._id });
  if (!service) throw new AppError('Service not found', 404);

  if (req.file) {
    if (service.imageFileId) await deleteFromImageKit(service.imageFileId);
    const { url, fileId } = await uploadToImageKit(req.file, 'service-images');
    req.body.image = url;
    req.body.imageFileId = fileId;
  }

  Object.assign(service, req.body);
  await service.save();
  success(res, 'Service updated', service);
});

exports.deleteService = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const service = await Service.findOne({ _id: req.params.id, salon: salon._id });
  if (!service) throw new AppError('Service not found', 404);
  service.isActive = false;
  await service.save();
  success(res, 'Service deactivated');
});
