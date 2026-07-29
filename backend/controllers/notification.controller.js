const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { recipientId: req.user._id };
    const [notifications, totalRecords, unreadCount] = await Promise.all([
      Notification.find(filter)
        .select(
          "_id channel type referenceType referenceId status scheduledFor sentAt createdAt metadata isRead readAt"
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: { $ne: true } }),
    ]);
    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: {
        notifications,
        unreadCount,
        pagination: { page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit) },
      },
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user._id,
    });
    if (!notification)
      return res.status(404).json({ success: false, message: "Notification not found" });

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Notification marked as read", data: { notification } });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipientId: req.user._id, isRead: { $ne: true } },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return res.status(200).json({
      success: true,
      message: "Notifications marked as read",
      data: { updatedCount: result.modifiedCount },
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user._id,
    });
    if (!notification)
      return res.status(404).json({ success: false, message: "Notification not found" });
    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: { notificationId: notification._id },
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
