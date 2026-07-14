const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 0.5,
      immutable: true,
    },
    leaveDates: {
      type: [Date],
      required: true,
      immutable: true,
    },
    leaveDaysByYear: {
      type: [
        {
          year: {
            type: Number,
            required: true,
          },
          days: {
            type: Number,
            required: true,
            min: 0.5,
          },
        },
      ],
      required: true,
      immutable: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    document: {
      publicId: { type: String, trim: true, immutable: true },
      url: { type: String, trim: true, immutable: true },
      originalName: { type: String, trim: true, immutable: true },
      mimeType: { type: String, trim: true, immutable: true },
      size: { type: Number, min: 0, immutable: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approverComment: {
      type: String,
      trim: true,
      default: "",
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leaveRequestSchema.index({ userId: 1, createdAt: -1 });
leaveRequestSchema.index({ userId: 1, status: 1, startDate: 1, endDate: 1 });
leaveRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
