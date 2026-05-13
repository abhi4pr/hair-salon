import Service from '../models/Service.js';
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

export const createService = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  if (req.file) {
    const { url, fileId } = await uploadToImageKit(req.file, 'service-images');
    req.body.image = url;
    req.body.imageFileId = fileId;
  }
  const service = await Service.create({ ...req.body, salon: salon._id });
  success(res, 'Service created', service, 201);
});

export const getServicesBySalon = asyncHandler(async (req, res) => {
  const services = await Service.find({ salon: req.params.salonId, isActive: true });
  success(res, 'Services fetched', services);
});

export const getMyServices = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const services = await Service.find({ salon: salon._id });
  success(res, 'Services fetched', services);
});

export const updateService = asyncHandler(async (req, res) => {
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

export const deleteService = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const service = await Service.findOne({ _id: req.params.id, salon: salon._id });
  if (!service) throw new AppError('Service not found', 404);
  service.isActive = false;
  await service.save();
  success(res, 'Service deactivated');
});
