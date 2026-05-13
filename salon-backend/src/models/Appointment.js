import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },

    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },

    paymentMethod: {
      type: String,
      enum: ['cash', 'wallet', 'loyalty_points', 'partial'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'refunded'],
      default: 'unpaid',
    },

    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    tipAmount: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    loyaltyPointsUsed: { type: Number, default: 0 },
    walletAmountUsed: { type: Number, default: 0 },

    couponCode: { type: String, default: null },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null },

    invoiceUrl: { type: String, default: '' },

    cancelledBy: { type: String, enum: ['customer', 'salon', null], default: null },
    cancellationReason: { type: String, default: '' },

    notes: { type: String, default: '' },
    isWalkIn: { type: Boolean, default: false },
    isRepeat: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },

    waitingList: [{ customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, joinedAt: Date }],
  },
  { timestamps: true }
);

appointmentSchema.index({ salon: 1, date: 1, status: 1 });
appointmentSchema.index({ customer: 1, date: -1 });

export default mongoose.model('Appointment', appointmentSchema);
