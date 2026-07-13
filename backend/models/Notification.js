const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
    channel: { type: String, enum: ["email", "in_app", "sms"], default: "email", immutable: true },
    type: { type: String, required: true, trim: true, maxlength: 100, immutable: true },
    referenceType: { type: String, trim: true, default: "", immutable: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null, immutable: true },
    template: { type: String, trim: true, default: "", immutable: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {}, immutable: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {}, immutable: true },
    dedupeKey: { type: String, required: true, unique: true, trim: true, immutable: true },
    scheduledFor: { type: Date, default: Date.now, immutable: true },
    status: { type: String, enum: ["queued", "processing", "sent", "failed", "cancelled"], default: "queued" },
    lockUntil: { type: Date, default: null },
    attemptCount: { type: Number, default: 0, min: 0 },
    nextAttemptAt: { type: Date, default: Date.now },
    lastError: { type: String, trim: true, maxlength: 1000, default: "" },
    sentAt: { type: Date, default: null },
    providerMessageId: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

notificationSchema.index({ status: 1, nextAttemptAt: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ referenceType: 1, referenceId: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
