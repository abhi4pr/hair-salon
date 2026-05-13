const Offer = require('../models/Offer');
const Salon = require('../models/Salon');
const AppError = require('../../errors/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

exports.createOffer = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);
  const offer = await Offer.create({ ...req.body, salon: salon._id });
  success(res, 'Offer created', offer, 201);
});

exports.getMyOffers = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  const offers = await Offer.find({ salon: salon?._id });
  success(res, 'Offers fetched', offers);
});

exports.getSalonOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({
    $or: [{ salon: req.params.salonId }, { salon: null }],
    isActive: true,
    validFrom: { $lte: new Date() },
    validTo: { $gte: new Date() },
  }).select('-usedBy');
  success(res, 'Offers fetched', offers);
});

exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, salonId, orderAmount } = req.body;
  const offer = await Offer.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validTo: { $gte: new Date() },
    $or: [{ salon: salonId }, { salon: null }],
  });

  if (!offer) throw new AppError('Invalid or expired coupon', 400);
  if (offer.usageLimit && offer.usedCount >= offer.usageLimit) throw new AppError('Coupon usage limit reached', 400);
  if (parseFloat(orderAmount) < offer.minOrderValue) throw new AppError(`Min order ₹${offer.minOrderValue} required`, 400);

  const userUsed = offer.usedBy.filter((u) => u.toString() === req.user._id.toString()).length;
  if (userUsed >= (offer.perUserLimit || 1)) throw new AppError('Coupon already used', 400);

  let discountAmount = 0;
  if (offer.type === 'percent') {
    discountAmount = (parseFloat(orderAmount) * offer.value) / 100;
    if (offer.maxDiscount) discountAmount = Math.min(discountAmount, offer.maxDiscount);
  } else if (offer.type === 'fixed') {
    discountAmount = Math.min(offer.value, parseFloat(orderAmount));
  }

  success(res, 'Coupon valid', { offer: { code: offer.code, type: offer.type, value: offer.value }, discountAmount });
});

exports.updateOffer = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  const offer = await Offer.findOne({ _id: req.params.id, salon: salon?._id });
  if (!offer) throw new AppError('Offer not found', 404);
  Object.assign(offer, req.body);
  await offer.save();
  success(res, 'Offer updated', offer);
});

exports.deleteOffer = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  const offer = await Offer.findOne({ _id: req.params.id, salon: salon?._id });
  if (!offer) throw new AppError('Offer not found', 404);
  offer.isActive = false;
  await offer.save();
  success(res, 'Offer deactivated');
});
