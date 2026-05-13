const moment = require('moment');
const Appointment = require('../models/Appointment');
const Salon = require('../models/Salon');
const Review = require('../models/Review');
const AppError = require('../../errors/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const getSalonForOwner = async (ownerId) => {
  const salon = await Salon.findOne({ owner: ownerId });
  if (!salon) throw new AppError('Salon not found', 404);
  return salon;
};

exports.getRevenueReport = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const { period = 'monthly', year = new Date().getFullYear(), month } = req.query;

  let match = { salon: salon._id, status: 'completed', paymentStatus: 'paid' };
  if (period === 'daily' && month) {
    const start = moment(`${year}-${month}-01`).startOf('month');
    const end = moment(start).endOf('month');
    match.date = { $gte: start.toDate(), $lte: end.toDate() };
  } else {
    match.date = { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) };
  }

  const groupBy = period === 'daily' ? { $dayOfMonth: '$date' } : { $month: '$date' };
  const report = await Appointment.aggregate([
    { $match: match },
    { $group: { _id: groupBy, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 }, tips: { $sum: '$tipAmount' } } },
    { $sort: { _id: 1 } },
  ]);

  success(res, 'Revenue report', report);
});

exports.getBookingStats = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const { startDate, endDate } = req.query;

  const match = { salon: salon._id };
  if (startDate && endDate) match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const [stats] = await Appointment.aggregate([
    { $match: match },
    { $group: {
      _id: null,
      total: { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
      noShow: { $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] } },
      totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0] } },
    }},
  ]);

  success(res, 'Booking stats', stats || {});
});

exports.getPeakHours = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const report = await Appointment.aggregate([
    { $match: { salon: salon._id, status: { $in: ['completed', 'confirmed'] } } },
    { $group: { _id: { $substr: ['$startTime', 0, 2] }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  success(res, 'Peak hours', report);
});

exports.getStaffPerformance = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const report = await Appointment.aggregate([
    { $match: { salon: salon._id, staff: { $ne: null }, status: 'completed' } },
    { $group: { _id: '$staff', bookings: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    { $lookup: { from: 'staff', localField: '_id', foreignField: '_id', as: 'staffInfo' } },
    { $unwind: { path: '$staffInfo', preserveNullAndEmpty: true } },
    { $sort: { bookings: -1 } },
  ]);
  success(res, 'Staff performance', report);
});

exports.getServicePopularity = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const report = await Appointment.aggregate([
    { $match: { salon: salon._id, status: 'completed' } },
    { $unwind: '$services' },
    { $group: { _id: '$services', count: { $sum: 1 } } },
    { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
    { $unwind: '$service' },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  success(res, 'Service popularity', report);
});

exports.getCancellationReport = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const report = await Appointment.aggregate([
    { $match: { salon: salon._id, status: 'cancelled' } },
    { $group: { _id: '$cancelledBy', count: { $sum: 1 } } },
  ]);
  success(res, 'Cancellation report', report);
});

exports.getTaxReport = asyncHandler(async (req, res) => {
  const salon = await getSalonForOwner(req.user._id);
  const { month, year } = req.query;
  const start = moment(`${year}-${month}-01`).startOf('month');
  const end = moment(start).endOf('month');

  const [report] = await Appointment.aggregate([
    { $match: { salon: salon._id, status: 'completed', date: { $gte: start.toDate(), $lte: end.toDate() } } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalTax: { $sum: '$taxAmount' }, bookings: { $sum: 1 } } },
  ]);
  success(res, 'Tax report', report || {});
});
