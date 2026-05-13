const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  senderRole: { type: String, enum: ['customer', 'salon_owner', 'support'] },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const supportTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    salon: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', default: null },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    replies: [replySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
