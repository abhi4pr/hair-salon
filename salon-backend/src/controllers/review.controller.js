const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Salon = require('../models/Salon');
const Staff = require('../models/Staff');
const AppError = require('../../errors/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const paginate = require('../utils/paginate');
const { uploadToImageKit } = require('../middlewares/upload.middleware');

const updateSalonRating = async (salonId) => {
  const reviews = await Review.find({ salon: salonId, isModerated: false });
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.salonRating, 0) / reviews.length : 0;
  await Salon.findByIdAndUpdate(salonId, { averageRating: parseFloat(avg.toFixed(1)), totalReviews: reviews.length });
};

const updateStaffRating = async (staffId) => {
  const reviews = await Review.find({ staff: staffId, staffRating: { $ne: null }, isModerated: false });
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.staffRating, 0) / reviews.length : 0;
  await Staff.findByIdAndUpdate(staffId, { averageRating: parseFloat(avg.toFixed(1)), totalReviews: reviews.length });
};

exports.createReview = asyncHandler(async (req, res) => {
  const { appointmentId, salonRating, staffRating, serviceRating, comment } = req.body;

  const appt = await Appointment.findById(appointmentId);
  if (!appt) throw new AppError('Appointment not found', 404);
  if (appt.customer.toString() !== req.user._id.toString()) throw new AppError('Forbidden', 403);
  if (appt.status !== 'completed') throw new AppError('Can only review completed appointments', 400);

  const existing = await Review.findOne({ appointment: appointmentId });
  if (existing) throw new AppError('Already reviewed this appointment', 409);

  const images = [];
  if (req.files?.length) {
    const uploads = await Promise.all(req.files.map((f) => uploadToImageKit(f, 'review-images')));
    images.push(...uploads);
  }

  const review = await Review.create({
    customer: req.user._id,
    salon: appt.salon,
    staff: appt.staff,
    appointment: appointmentId,
    salonRating,
    staffRating,
    serviceRating,
    comment,
    images,
  });

  await updateSalonRating(appt.salon);
  if (appt.staff) await updateStaffRating(appt.staff);

  success(res, 'Review submitted', review, 201);
});

exports.getSalonReviews = asyncHandler(async (req, res) => {
  const { data, pagination } = await paginate(
    Review,
    { salon: req.params.salonId, isModerated: false },
    { page: req.query.page, limit: req.query.limit, populate: 'customer staff', sort: { createdAt: -1 } }
  );
  success(res, 'Reviews fetched', data, 200, pagination);
});

exports.replyToReview = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);

  const review = await Review.findOne({ _id: req.params.id, salon: salon._id });
  if (!review) throw new AppError('Review not found', 404);

  review.reply = { text: req.body.reply, repliedAt: new Date() };
  await review.save();
  success(res, 'Reply added', review);
});

exports.reportReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  review.isReported = true;
  review.reportReason = req.body.reason;
  await review.save();
  success(res, 'Review reported');
});

exports.moderateReview = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  const review = await Review.findOne({ _id: req.params.id, salon: salon?._id });
  if (!review) throw new AppError('Review not found', 404);
  review.isModerated = true;
  await review.save();
  await updateSalonRating(review.salon);
  success(res, 'Review moderated');
});
