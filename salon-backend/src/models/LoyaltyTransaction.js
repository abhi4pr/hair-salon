const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    type: { type: String, enum: ['earned', 'redeemed', 'referral_bonus', 'expired', 'adjusted'], required: true },
    points: { type: Number, required: true },
    balance: { type: Number, required: true },
    description: { type: String },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
