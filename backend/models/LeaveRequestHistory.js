const mongoose = require("mongoose");

const leaveRequestHistorySchema = new mongoose.Schema(
  {
    leaveRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveRequest",
      required: true,
      immutable: true,
    },
    action: {
      type: String,
      enum: ["submitted", "approved", "rejected", "cancelled"],
      required: true,
      immutable: true,
    },
    previousStatus: {
      type: String,
      enum: [null, "pending", "approved", "rejected", "cancelled"],
      default: null,
      immutable: true,
    },
    nextStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      required: true,
      immutable: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    actorRole: {
      type: String,
      enum: ["employee", "manager", "hr", "admin"],
      required: true,
      immutable: true,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
      immutable: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    strict: "throw",
    versionKey: false,
  }
);

leaveRequestHistorySchema.index({ leaveRequestId: 1, createdAt: -1 });
leaveRequestHistorySchema.index({ actorId: 1, createdAt: -1 });

leaveRequestHistorySchema.pre("save", function preventExistingHistorySave(next) {
  if (!this.isNew) {
    return next(new Error("Leave request history is append-only and cannot be modified"));
  }

  return next();
});

const preventHistoryMutation = function preventHistoryMutation(next) {
  next(new Error("Leave request history is append-only and cannot be modified or deleted"));
};

leaveRequestHistorySchema.pre("updateOne", preventHistoryMutation);
leaveRequestHistorySchema.pre("updateMany", preventHistoryMutation);
leaveRequestHistorySchema.pre("findOneAndUpdate", preventHistoryMutation);
leaveRequestHistorySchema.pre("replaceOne", preventHistoryMutation);
leaveRequestHistorySchema.pre("findOneAndReplace", preventHistoryMutation);
leaveRequestHistorySchema.pre("deleteOne", preventHistoryMutation);
leaveRequestHistorySchema.pre("deleteMany", preventHistoryMutation);
leaveRequestHistorySchema.pre("findOneAndDelete", preventHistoryMutation);

module.exports = mongoose.model("LeaveRequestHistory", leaveRequestHistorySchema);
