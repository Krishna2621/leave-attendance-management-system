const Attendance = require("../models/Attendance");

const attendanceTimezone = process.env.ATTENDANCE_TIMEZONE || "Asia/Kolkata";
const shiftStartTime = process.env.SHIFT_START_TIME || "09:30";
const lateGraceMinutes = Number(process.env.LATE_GRACE_MINUTES || 0);
const fullDayMinimumHours = Number(process.env.FULL_DAY_MIN_HOURS || 8);
const halfDayMinimumHours = Number(process.env.HALF_DAY_MIN_HOURS || 4);

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

const getAttendanceStatus = (hoursWorked) => {
  if (hoursWorked >= fullDayMinimumHours) {
    return "present";
  }

  if (hoursWorked >= halfDayMinimumHours) {
    return "half-day";
  }

  return "absent";
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

const punchOut = async (req, res) => {
  try {
    const now = new Date();
    const date = getBusinessDate(now);
    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date,
    });

    if (!attendance || !attendance.punchIn) {
      return res.status(404).json({
        success: false,
        message: "No punch-in record found for today",
      });
    }

    if (attendance.punchOut) {
      return res.status(409).json({
        success: false,
        message: "Punch-out has already been recorded for today",
      });
    }

    if (now <= attendance.punchIn) {
      return res.status(400).json({
        success: false,
        message: "Punch-out time must be later than punch-in time",
      });
    }

    const hoursWorked = Math.round(((now - attendance.punchIn) / (60 * 60 * 1000)) * 100) / 100;

    attendance.punchOut = now;
    attendance.hoursWorked = hoursWorked;
    attendance.status = getAttendanceStatus(hoursWorked);

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Punch-out recorded successfully",
      data: {
        attendance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(`${startDate}T00:00:00.000Z`);
      }

      if (endDate) {
        filter.date.$lte = new Date(`${endDate}T00:00:00.000Z`);
      }
    }

    const skip = (page - 1) * limit;
    const [attendance, totalRecords] = await Promise.all([
      Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Attendance.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Attendance history retrieved successfully",
      data: {
        attendance,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
        },
      },
    });
  } catch (error) {
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
  punchOut,
  getAttendanceHistory,
  notImplemented,
};
