import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import paginate from '../utils/paginate.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const { data, pagination } = await paginate(Notification, { user: req.user._id }, {
    page: req.query.page, limit: req.query.limit, sort: { createdAt: -1 },
  });
  success(res, 'Notifications fetched', data, 200, pagination);
});

export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
  success(res, 'Notification marked as read');
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  success(res, 'All notifications marked as read');
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
  success(res, 'Unread count', { count });
});
