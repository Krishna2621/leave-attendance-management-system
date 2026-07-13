const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    maxDaysPerYear: {
      type: Number,
      required: true,
      min: 0,
    },
    carryForward: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

leaveTypeSchema.index({ isActive: 1, name: 1 });

module.exports = mongoose.model("LeaveType", leaveTypeSchema);
