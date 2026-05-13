const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', default: null },
    name: { type: String, required: true },
    description: { type: String },
    durationDays: { type: Number, required: true },
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    loyaltyMultiplier: { type: Number, default: 1 },
    features: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const userMembershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    paymentMethod: { type: String, default: 'cash' },
    amountPaid: { type: Number },
  },
  { timestamps: true }
);

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
const UserMembership = mongoose.model('UserMembership', userMembershipSchema);

module.exports = { MembershipPlan, UserMembership };
