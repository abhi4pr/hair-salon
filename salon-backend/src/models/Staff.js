import mongoose from 'mongoose';

const workingHourSchema = new mongoose.Schema({
  day: { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
  start: { type: String, default: '09:00' },
  end: { type: String, default: '20:00' },
  isOff: { type: Boolean, default: false },
}, { _id: false });

const staffSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String },
    avatar: { type: String, default: '' },
    avatarFileId: { type: String, default: '' },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    workingHours: [workingHourSchema],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Staff', staffSchema);
