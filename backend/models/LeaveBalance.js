const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
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
    year: {
      type: Number,
      required: true,
    },
    allocated: {
      type: Number,
      required: true,
      min: 0,
    },
    used: {
      type: Number,
      default: 0,
      min: 0,
    },
    remaining: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

leaveBalanceSchema.pre("validate", function calculateRemaining(next) {
  this.remaining = this.allocated - this.used;
  next();
});

leaveBalanceSchema.index({ userId: 1, leaveTypeId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
