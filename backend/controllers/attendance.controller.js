const Attendance = require("../models/Attendance");

const attendanceTimezone = process.env.ATTENDANCE_TIMEZONE || "Asia/Kolkata";
const shiftStartTime = process.env.SHIFT_START_TIME || "09:30";
const lateGraceMinutes = Number(process.env.LATE_GRACE_MINUTES || 0);

const getDatePartsInTimezone = (date) => {
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: attendanceTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return dateParts.reduce((parts, part) => {
    if (part.type !== "literal") {
      parts[part.type] = Number(part.value);
    }

    return parts;
  }, {});
};

const getBusinessDate = (date) => {
  const { year, month, day } = getDatePartsInTimezone(date);

  return new Date(Date.UTC(year, month - 1, day));
};

const isLateCheckIn = (date) => {
  const { hour, minute } = getDatePartsInTimezone(date);
  const [shiftHour, shiftMinute] = shiftStartTime.split(":").map(Number);
  const checkInMinutes = hour * 60 + minute;
  const shiftStartMinutes = shiftHour * 60 + shiftMinute + lateGraceMinutes;

  return checkInMinutes > shiftStartMinutes;
};

const punchIn = async (req, res) => {
  try {
    const now = new Date();
    const date = getBusinessDate(now);
    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date,
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "Attendance has already been marked for today",
      });
    }

    const attendance = await Attendance.create({
      userId: req.user._id,
      date,
      punchIn: now,
      status: "present",
      isLate: isLateCheckIn(now),
      note: req.body.note || "",
    });

    return res.status(201).json({
      success: true,
      message: "Punch-in recorded successfully",
      data: {
        attendance,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance has already been marked for today",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const notImplemented = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: "Attendance APIs are scheduled for Phase 2",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  punchIn,
  notImplemented,
};
