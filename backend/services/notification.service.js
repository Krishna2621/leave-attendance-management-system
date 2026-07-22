const Notification = require("../models/Notification");

const queueNotification = async ({ recipientId, channel = "email", type, referenceType = "", referenceId = null, template = "", payload = {}, metadata = {}, dedupeKey, scheduledFor = new Date(), session }) => {
  const notification = { recipientId, channel, type, referenceType, referenceId, template, payload, metadata, dedupeKey, scheduledFor, nextAttemptAt: scheduledFor };

  if (channel === "in_app") {
    notification.status = "sent";
    notification.sentAt = scheduledFor;
  }

  if (session) {
    const [created] = await Notification.create([notification], { session });
    return created;
  }

  try {
    return await Notification.create(notification);
  } catch (error) {
    if (error.code === 11000) return Notification.findOne({ dedupeKey }).lean();
    throw error;
  }
};

const queueNotifications = async (notifications) => {
  if (!notifications.length) return { queuedCount: 0 };
  const result = await Notification.bulkWrite(
    notifications.map((notification) => ({ updateOne: { filter: { dedupeKey: notification.dedupeKey }, update: { $setOnInsert: notification }, upsert: true } })),
    { ordered: false }
  );
  return { queuedCount: result.upsertedCount || 0 };
};

module.exports = { queueNotification, queueNotifications };
