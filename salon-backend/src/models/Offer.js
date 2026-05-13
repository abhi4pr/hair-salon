const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', default: null },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percent', 'fixed', 'cashback'], required: true },
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    applicableTo: {
      type: String,
      enum: ['all', 'first_booking', 'referral', 'seasonal', 'membership'],
      default: 'all',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
