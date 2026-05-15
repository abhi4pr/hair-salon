import ChatMessage from '../models/ChatMessage.js';
import SupportTicket from '../models/SupportTicket.js';
import Salon from '../models/Salon.js';
import AppError from '../../errors/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import paginate from '../utils/paginate.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { salonId, message } = req.body;
  const salon = await Salon.findById(salonId);
  if (!salon) throw new AppError('Salon not found', 404);
  const msg = await ChatMessage.create({ salon: salonId, customer: req.user._id, senderRole: req.user.role, message });
  success(res, 'Message sent', msg, 201);
});

export const getConversation = asyncHandler(async (req, res) => {
  const { salonId } = req.params;
  const { data, pagination } = await paginate(
    ChatMessage,
    { salon: salonId, customer: req.user._id },
    { page: req.query.page, limit: req.query.limit || 50, sort: { createdAt: 1 } }
  );
  await ChatMessage.updateMany({ salon: salonId, customer: req.user._id, senderRole: { $ne: req.user.role }, isRead: false }, { isRead: true });
  success(res, 'Conversation fetched', data, 200, pagination);
});

export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await ChatMessage.aggregate([
    { $match: { customer: req.user._id } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$salon',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: { $cond: [{ $and: [{ $eq: ['$isRead', false] }, { $eq: ['$senderRole', 'salon_owner'] }] }, 1, 0] },
        },
      },
    },
    { $lookup: { from: 'salons', localField: '_id', foreignField: '_id', as: 'salon' } },
    { $unwind: '$salon' },
  ]);
  success(res, 'Conversations fetched', conversations);
});

export const getSalonConversations = asyncHandler(async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user._id });
  if (!salon) throw new AppError('Salon not found', 404);

  const conversations = await ChatMessage.aggregate([
    { $match: { salon: salon._id } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$customer', lastMessage: { $first: '$$ROOT' }, unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ['$isRead', false] }, { $ne: ['$senderRole', 'salon_owner'] }] }, 1, 0] } } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'customer' } },
    { $unwind: '$customer' },
  ]);
  success(res, 'Conversations fetched', conversations);
});

export const createTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.create({ ...req.body, user: req.user._id });
  success(res, 'Support ticket created', ticket, 201);
});

export const getMyTickets = asyncHandler(async (req, res) => {
  const { data, pagination } = await paginate(SupportTicket, { user: req.user._id }, {
    page: req.query.page, limit: req.query.limit, sort: { createdAt: -1 },
  });
  success(res, 'Tickets fetched', data, 200, pagination);
});

export const replyToTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
  if (!ticket) throw new AppError('Ticket not found', 404);
  ticket.replies.push({ senderRole: req.user.role, message: req.body.message });
  await ticket.save();
  success(res, 'Reply added', ticket);
});
