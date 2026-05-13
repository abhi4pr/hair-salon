const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const paginate = require('../utils/paginate');

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const { data, pagination } = await paginate(Notification, { user: req.user._id }, {
    page: req.query.page,
    limit: req.query.limit,
    sort: { createdAt: -1 },
  });
  success(res, 'Notifications fetched', data, 200, pagination);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
  success(res, 'Notification marked as read');
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  success(res, 'All notifications marked as read');
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
  success(res, 'Unread count', { count });
});
