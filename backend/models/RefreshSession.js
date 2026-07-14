const mongoose = require("mongoose");

const refreshSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    deviceInfo: { type: String, trim: true, maxlength: 500, default: "" },
    ipAddress: { type: String, trim: true, maxlength: 45, default: "" },
    userAgent: { type: String, trim: true, maxlength: 512, default: "" },
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

refreshSessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });
refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshSession", refreshSessionSchema);
