const mongoose = require("mongoose");

const scheduledJobRunSchema = new mongoose.Schema(
  {
    jobName: { type: String, required: true, trim: true },
    runKey: { type: String, required: true, trim: true },
    status: { type: String, enum: ["running", "completed", "failed"], required: true },
    lockUntil: { type: Date, default: null },
    attemptCount: { type: Number, default: 1, min: 1 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    lastError: { type: String, trim: true, maxlength: 1000, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

scheduledJobRunSchema.index({ jobName: 1, runKey: 1 }, { unique: true });
scheduledJobRunSchema.index({ status: 1, lockUntil: 1 });

module.exports = mongoose.model("ScheduledJobRun", scheduledJobRunSchema);
