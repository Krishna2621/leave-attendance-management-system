const Notification = require("../models/Notification");
const { sendEmail } = require("../services/email.service");

const getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { recipientId: req.user._id };
    const [notifications, totalRecords] = await Promise.all([
      Notification.find(filter).select("_id channel type referenceType referenceId status scheduledFor sentAt createdAt metadata").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, message: "Notifications retrieved successfully", data: { notifications, pagination: { page, limit, totalRecords, totalPages: Math.ceil(totalRecords / limit) } } });
  } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const testNotificationEmail = async (req, res) => {
  try {
    if (!req.user.email) return res.status(400).json({ success: false, message: "Your account does not have an email address" });
    await sendEmail({ to: req.user.email, subject: "Notification service test", text: "The notification email service is configured successfully.", html: "<p>The notification email service is configured successfully.</p>" });
    return res.status(200).json({ success: true, message: "Test notification email sent successfully", data: { recipient: req.user.email } });
  } catch (error) {
    console.error("Test notification email failed", { userId: req.user._id, error: error.message });
    return res.status(502).json({ success: false, message: "Test notification email could not be sent" });
  }
};

module.exports = { getMyNotifications, testNotificationEmail };
