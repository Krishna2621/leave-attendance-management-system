const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendEmail } = require("./email.service");
const logger = require("../utils/logger");
const templates = {
  leave_approved: require("../templates/email/leaveApproved"),
  leave_rejected: require("../templates/email/leaveRejected"),
  leave_reminder: require("../templates/email/leaveReminder"),
  attendance_reminder: require("../templates/email/attendanceReminder"),
};
const maxAttempts = Number(process.env.NOTIFICATION_MAX_ATTEMPTS || 5);
const lockMinutes = Number(process.env.NOTIFICATION_LOCK_MINUTES || 5);
const retryBaseMinutes = Number(process.env.NOTIFICATION_RETRY_BASE_MINUTES || 1);
const cleanError = (error) => String(error.message || "Notification delivery failed").slice(0, 1000);

const claimNotification = async () => {
  const now = new Date();
  return Notification.findOneAndUpdate(
    { channel: "email", status: { $in: ["queued", "processing"] }, scheduledFor: { $lte: now }, nextAttemptAt: { $lte: now }, attemptCount: { $lt: maxAttempts }, $or: [{ status: "queued" }, { lockUntil: { $lt: now } }] },
    { $set: { status: "processing", lockUntil: new Date(now.getTime() + lockMinutes * 60000) }, $inc: { attemptCount: 1 } },
    { new: true }
  );
};

const dispatchOne = async (notification) => {
  const recipient = await User.findOne({ _id: notification.recipientId, isActive: true }).select("name email").lean();
  if (!recipient?.email) throw new Error("Notification recipient has no active email address");
  const template = templates[notification.template];
  if (!template) throw new Error(`Unsupported email notification template: ${notification.template}`);
  const message = template({ recipientName: recipient.name, ...notification.payload });
  const result = await sendEmail({ to: recipient.email, ...message });
  await Notification.updateOne({ _id: notification._id }, { $set: { status: "sent", sentAt: new Date(), lockUntil: null, lastError: "", providerMessageId: result.messageId || "" } });
};

const dispatchQueuedNotifications = async ({ limit = Number(process.env.NOTIFICATION_BATCH_SIZE || 50) } = {}) => {
  const summary = { processedCount: 0, sentCount: 0, failedCount: 0 };
  for (let index = 0; index < limit; index += 1) {
    const notification = await claimNotification();
    if (!notification) break;
    summary.processedCount += 1;
    try {
      await dispatchOne(notification);
      summary.sentCount += 1;
    } catch (error) {
      const finalAttempt = notification.attemptCount >= maxAttempts;
      const retryDelay = retryBaseMinutes * 2 ** Math.max(notification.attemptCount - 1, 0);
      await Notification.updateOne({ _id: notification._id }, { $set: { status: finalAttempt ? "failed" : "queued", lockUntil: null, nextAttemptAt: new Date(Date.now() + retryDelay * 60000), lastError: cleanError(error) } });
      summary.failedCount += 1;
      logger.error("Notification delivery failed", { notificationId: notification._id, type: notification.type, error: cleanError(error) });
    }
  }
  return summary;
};

module.exports = { dispatchQueuedNotifications };
