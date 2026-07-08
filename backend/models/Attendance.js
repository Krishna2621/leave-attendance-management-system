const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  punchIn: {
    type: Date,
    default: null,
  },
  punchOut: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["present", "absent", "late", "half-day", "holiday"],
    required: true,
  },
  hoursWorked: {
    type: Number,
    default: 0,
  },
  note: {
    type: String,
    trim: true,
    default: "",
  },
  correctionRequested: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
