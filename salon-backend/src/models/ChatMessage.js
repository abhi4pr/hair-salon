const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['customer', 'salon_owner'], required: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chatMessageSchema.index({ salon: 1, customer: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
