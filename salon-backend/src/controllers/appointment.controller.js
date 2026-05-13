const moment = require('moment');
const Salon = require('../models/Salon');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Offer = require('../models/Offer');
const User = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const AppError = require('../../errors/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const paginate = require('../utils/paginate');
const { generateSlots, toMinutes, toTimeStr } = require('../helpers/slot.helper');
const { pointsFromAmount, amountFromPoints } = require('../helpers/loyalty.helper');
const { sendPush } = require('../utils/sendPush');
const sendEmail = require('../utils/sendEmail');

const TAX_RATE = parseFloat(process.env.TAX_RATE_PERCENT || 18) / 100;

exports.getAvailableSlots = asyncHandler(async (req, res) => {
  const { date, services, staffId } = req.query;
  if (!date || !services) throw new AppError('date and services are required', 400);

  const salon = await Salon.findById(req.params.salonId);
  if (!salon) throw new AppError('Salon not found', 404);

  const serviceIds = Array.isArray(services) ? services : services.split(',');
  const serviceDocs = await Service.find({ _id: { $in: serviceIds }, isActive: true });
  const totalDuration = serviceDocs.reduce((sum, s) => sum + s.duration, 0);

  const targetDate = moment(date).startOf('day');
  const existingAppointments = await Appointment.find({
    salon: salon._id,
    date: { $gte: targetDate.toDate(), $lt: moment(targetDate).endOf('day').toDate() },
    status: { $in: ['pending', 'confirmed', 'in_progress'] },
  });

  const slots = generateSlots(salon, targetDate.toDate(), existingAppointments, totalDuration, staffId);
  success(res, 'Slots fetched', { date, totalDuration, slots });
});

exports.createAppointment = asyncHandler(async (req, res) => {
  const { salonId, services: serviceIds, date, startTime, staffId, paymentMethod, couponCode, notes, isWalkIn } = req.body;

  const salon = await Salon.findById(salonId);
  if (!salon || !salon.isActive) throw new AppError('Salon not found', 404);

  const serviceDocs = await Service.find({ _id: { $in: serviceIds }, salon: salonId, isActive: true });
  if (serviceDocs.length !== serviceIds.length) throw new AppError('Some services are invalid', 400);

  const totalDuration = serviceDocs.reduce((sum, s) => sum + s.duration, 0);
  const startMin = toMinutes(startTime);
  const endTime = toTimeStr(startMin + totalDuration);

  const targetDate = moment(date).startOf('day');
  const existingAppointments = await Appointment.find({
    salon: salonId,
    date: { $gte: targetDate.toDate(), $lt: moment(targetDate).endOf('day').toDate() },
    status: { $in: ['pending', 'confirmed', 'in_progress'] },
    ...(staffId ? { staff: staffId } : {}),
  });

  const slots = generateSlots(salon, targetDate.toDate(), existingAppointments, totalDuration, staffId);
  const slotAvailable = slots.find((s) => s.startTime === startTime);
  if (!slotAvailable) throw new AppError('Selected time slot is not available', 409);

  let subtotal = serviceDocs.reduce((sum, s) => sum + (s.discountPrice ?? s.price), 0);
  let discountAmount = 0;
  let couponId = null;
  let cashbackAmount = 0;

  if (couponCode) {
    const offer = await Offer.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() },
      $or: [{ salon: salonId }, { salon: null }],
    });

    if (!offer) throw new AppError('Invalid or expired coupon', 400);
    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) throw new AppError('Coupon usage limit reached', 400);
    if (subtotal < offer.minOrderValue) throw new AppError(`Minimum order value ₹${offer.minOrderValue} required`, 400);

    const userUsed = offer.usedBy.filter((u) => u.toString() === req.user._id.toString()).length;
    if (userUsed >= (offer.perUserLimit || 1)) throw new AppError('You have already used this coupon', 400);

    if (offer.type === 'percent') {
      discountAmount = (subtotal * offer.value) / 100;
      if (offer.maxDiscount) discountAmount = Math.min(discountAmount, offer.maxDiscount);
    } else if (offer.type === 'fixed') {
      discountAmount = Math.min(offer.value, subtotal);
    } else if (offer.type === 'cashback') {
      cashbackAmount = offer.value;
    }

    offer.usedCount += 1;
    offer.usedBy.push(req.user._id);
    await offer.save();
    couponId = offer._id;
  }

  const user = await User.findById(req.user._id);
  let loyaltyPointsUsed = 0;
  let walletAmountUsed = 0;

  if (paymentMethod === 'loyalty_points') {
    const maxRedeemable = Math.min(user.loyaltyPoints, Math.floor(subtotal / amountFromPoints(1)));
    loyaltyPointsUsed = maxRedeemable;
    discountAmount += amountFromPoints(loyaltyPointsUsed);
  }

  if (paymentMethod === 'wallet' || paymentMethod === 'partial') {
    walletAmountUsed = Math.min(user.walletBalance, subtotal - discountAmount);
    discountAmount += walletAmountUsed;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = parseFloat((taxableAmount * TAX_RATE).toFixed(2));
  const totalAmount = parseFloat((taxableAmount + taxAmount).toFixed(2));

  const status = salon.bookingApprovalRequired ? 'pending' : 'confirmed';

  const appointment = await Appointment.create({
    customer: req.user._id,
    salon: salonId,
    staff: staffId || null,
    services: serviceIds,
    date: targetDate.toDate(),
    startTime,
    endTime,
    status,
    paymentMethod: paymentMethod || 'cash',
    totalAmount,
    taxAmount,
    discountAmount,
    loyaltyPointsUsed,
    walletAmountUsed,
    couponCode: couponCode || null,
    couponId,
    notes,
    isWalkIn: isWalkIn || false,
  });

  if (loyaltyPointsUsed > 0) {
    user.loyaltyPoints -= loyaltyPointsUsed;
    await LoyaltyTransaction.create({
      user: user._id,
      appointment: appointment._id,
      type: 'redeemed',
      points: -loyaltyPointsUsed,
      balance: user.loyaltyPoints,
      description: 'Redeemed for appointment',
    });
  }
  if (walletAmountUsed > 0) {
    user.walletBalance -= walletAmountUsed;
  }
  await user.save();

  const salonOwner = await User.findById(salon.owner);
  if (salonOwner?.fcmToken) {
    await sendPush({
      token: salonOwner.fcmToken,
      title: 'New Booking',
      body: `${user.name} booked an appointment for ${moment(date).format('DD MMM')} at ${startTime}`,
      data: { appointmentId: appointment._id.toString() },
    });
  }

  await sendEmail({
    to: user.email,
    subject: 'Booking Confirmed',
    html: `<h2>Your booking is ${status}!</h2><p>Date: ${moment(date).format('DD MMM YYYY')} at ${startTime}</p><p>Total: ₹${totalAmount}</p>`,
  });

  success(res, 'Appointment booked successfully', appointment, 201);
});

exports.getMyAppointments = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const query = { customer: req.user._id };
  if (status) query.status = status;

  const { data, pagination } = await paginate(Appointment, query, {
    page, limit, populate: 'salon staff services', sort: { date: -1 }
  });
  success(res, 'Appointments fetched', data, 200, pagination);
});

exports.getSalonAppointments = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);

  const { status, date, page, limit } = req.query;
  const query = { salon: salon._id };
  if (status) query.status = status;
  if (date) {
    const d = moment(date).startOf('day');
    query.date = { $gte: d.toDate(), $lt: moment(d).endOf('day').toDate() };
  }

  const { data, pagination } = await paginate(Appointment, query, {
    page, limit, populate: 'customer staff services', sort: { date: 1 }
  });
  success(res, 'Appointments fetched', data, 200, pagination);
});

exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('salon', 'name location qrImage')
    .populate('staff', 'name avatar')
    .populate('services', 'name price duration');

  if (!appt) throw new AppError('Appointment not found', 404);

  const isOwner = appt.customer._id.toString() === req.user._id.toString();
  const salon = await Salon.findById(appt.salon._id);
  const isSalonOwner = salon?.owner.toString() === req.user._id.toString();
  if (!isOwner && !isSalonOwner) throw new AppError('Forbidden', 403);

  success(res, 'Appointment fetched', appt);
});

exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);

  const appt = await Appointment.findOne({ _id: req.params.id, salon: salon._id });
  if (!appt) throw new AppError('Appointment not found', 404);

  appt.status = status;
  await appt.save();

  if (status === 'completed') {
    const points = pointsFromAmount(appt.totalAmount);
    const user = await User.findById(appt.customer);
    user.loyaltyPoints += points;
    await user.save();
    await LoyaltyTransaction.create({
      user: user._id,
      appointment: appt._id,
      type: 'earned',
      points,
      balance: user.loyaltyPoints,
      description: `Earned from appointment`,
    });

    if (user.fcmToken) {
      await sendPush({ token: user.fcmToken, title: 'Service Completed', body: `You earned ${points} loyalty points!` });
    }
  }

  success(res, `Appointment ${status}`, appt);
});

exports.cancelAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new AppError('Appointment not found', 404);

  const isCustomer = appt.customer.toString() === req.user._id.toString();
  const salon = await Salon.findById(appt.salon);
  const isSalonOwner = salon?.owner.toString() === req.user._id.toString();

  if (!isCustomer && !isSalonOwner) throw new AppError('Forbidden', 403);
  if (['completed', 'cancelled'].includes(appt.status)) throw new AppError('Cannot cancel this appointment', 400);

  appt.status = 'cancelled';
  appt.cancelledBy = isCustomer ? 'customer' : 'salon';
  appt.cancellationReason = req.body.reason || '';

  if (appt.loyaltyPointsUsed > 0) {
    const user = await User.findById(appt.customer);
    user.loyaltyPoints += appt.loyaltyPointsUsed;
    await user.save();
    await LoyaltyTransaction.create({
      user: user._id,
      appointment: appt._id,
      type: 'adjusted',
      points: appt.loyaltyPointsUsed,
      balance: user.loyaltyPoints,
      description: 'Refunded on cancellation',
    });
  }

  if (appt.walletAmountUsed > 0) {
    await User.findByIdAndUpdate(appt.customer, { $inc: { walletBalance: appt.walletAmountUsed } });
  }

  await appt.save();
  success(res, 'Appointment cancelled', appt);
});

exports.rescheduleAppointment = asyncHandler(async (req, res) => {
  const { date, startTime } = req.body;
  const appt = await Appointment.findById(req.params.id).populate('services');
  if (!appt) throw new AppError('Appointment not found', 404);
  if (appt.customer.toString() !== req.user._id.toString()) throw new AppError('Forbidden', 403);
  if (!['pending', 'confirmed'].includes(appt.status)) throw new AppError('Cannot reschedule this appointment', 400);

  const salon = await Salon.findById(appt.salon);
  const totalDuration = appt.services.reduce((sum, s) => sum + s.duration, 0);
  const targetDate = moment(date).startOf('day');
  const existingAppointments = await Appointment.find({
    salon: salon._id,
    _id: { $ne: appt._id },
    date: { $gte: targetDate.toDate(), $lt: moment(targetDate).endOf('day').toDate() },
    status: { $in: ['pending', 'confirmed', 'in_progress'] },
  });

  const slots = generateSlots(salon, targetDate.toDate(), existingAppointments, totalDuration, appt.staff);
  if (!slots.find((s) => s.startTime === startTime)) throw new AppError('Selected slot not available', 409);

  appt.date = targetDate.toDate();
  appt.startTime = startTime;
  appt.endTime = toTimeStr(toMinutes(startTime) + totalDuration);
  await appt.save();

  success(res, 'Appointment rescheduled', appt);
});

exports.addToWaitingList = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new AppError('Appointment not found', 404);
  const alreadyIn = appt.waitingList.some((w) => w.customer.toString() === req.user._id.toString());
  if (alreadyIn) throw new AppError('Already in waiting list', 400);
  appt.waitingList.push({ customer: req.user._id, joinedAt: new Date() });
  await appt.save();
  success(res, 'Added to waiting list');
});
