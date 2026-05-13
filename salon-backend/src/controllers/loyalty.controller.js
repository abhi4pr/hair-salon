const User = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const { MembershipPlan, UserMembership } = require('../models/Membership');
const AppError = require('../../errors/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const paginate = require('../utils/paginate');

exports.getMyLoyaltyBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('loyaltyPoints walletBalance referralCode');
  success(res, 'Loyalty info fetched', user);
});

exports.getLoyaltyHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await paginate(LoyaltyTransaction, { user: req.user._id }, {
    page: req.query.page,
    limit: req.query.limit,
    sort: { createdAt: -1 },
  });
  success(res, 'Loyalty history fetched', data, 200, pagination);
});

exports.getMembershipPlans = asyncHandler(async (req, res) => {
  const plans = await MembershipPlan.find({ isActive: true, $or: [{ salon: req.params.salonId || null }, { salon: null }] });
  success(res, 'Plans fetched', plans);
});

exports.purchaseMembership = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.findById(req.body.planId);
  if (!plan || !plan.isActive) throw new AppError('Plan not found', 404);

  const existing = await UserMembership.findOne({ user: req.user._id, plan: plan._id, isActive: true, endDate: { $gte: new Date() } });
  if (existing) throw new AppError('Already have an active membership', 400);

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.durationDays);

  const membership = await UserMembership.create({
    user: req.user._id,
    plan: plan._id,
    salon: req.body.salonId || null,
    startDate,
    endDate,
    amountPaid: plan.price,
    paymentMethod: req.body.paymentMethod || 'cash',
  });

  success(res, 'Membership purchased', membership, 201);
});

exports.getMyMemberships = asyncHandler(async (req, res) => {
  const memberships = await UserMembership.find({ user: req.user._id }).populate('plan');
  success(res, 'Memberships fetched', memberships);
});

exports.createMembershipPlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.create(req.body);
  success(res, 'Plan created', plan, 201);
});
