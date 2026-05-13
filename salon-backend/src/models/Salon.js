const mongoose = require('mongoose');

const businessHourSchema = new mongoose.Schema({
  day: { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], required: true },
  open: { type: String, default: '09:00' },
  close: { type: String, default: '20:00' },
  isClosed: { type: Boolean, default: false },
}, { _id: false });

const salonSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, enum: ['unisex', 'mens', 'womens', 'kids'], default: 'unisex' },

    images: [{ url: String, fileId: String }],
    videos: [{ url: String, fileId: String }],

    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      pincode: { type: String },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },

    businessHours: [businessHourSchema],
    holidays: [{ type: Date }],

    slotDuration: { type: Number, default: 30 },
    bufferTime: { type: Number, default: 10 },
    chairs: [{ name: String, isActive: { type: Boolean, default: true } }],

    bookingApprovalRequired: { type: Boolean, default: false },

    qrImage: { type: String, default: '' },
    qrImageFileId: { type: String, default: '' },

    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    isApproved: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

salonSchema.index({ 'location.coordinates': '2dsphere' });
salonSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Salon', salonSchema);
