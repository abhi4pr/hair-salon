const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },

    salonRating: { type: Number, min: 1, max: 5, required: true },
    staffRating: { type: Number, min: 1, max: 5, default: null },
    serviceRating: { type: Number, min: 1, max: 5, default: null },

    comment: { type: String, trim: true },
    images: [{ url: String, fileId: String }],

    reply: {
      text: { type: String },
      repliedAt: { type: Date },
    },

    isModerated: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
    reportReason: { type: String },
  },
  { timestamps: true }
);

reviewSchema.index({ salon: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
