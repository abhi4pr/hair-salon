import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    image: { type: String, default: '' },
    imageFileId: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Service', serviceSchema);
