const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { createAttendanceAuditLog } = require("../utils/auditLog");

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

const createAttendanceAuditEvent = async ({ req, attendance, action, beforeAttendance = {} }) => {
  try {
    await createAttendanceAuditLog({
      attendanceId: attendance._id,
      action,
      actor: req.user,
      targetUserId: attendance.userId,
      beforeAttendance,
      afterAttendance: attendance.toObject(),
      correctionReason: action === "corrected" ? attendance.correctionReason : "",
      source: "api",
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || null,
    });
  } catch (error) {
    console.error("Failed to create attendance audit log", {
      action,
      attendanceId: attendance._id,
      error: error.message,
    });
  }
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

    await createAttendanceAuditEvent({
      req,
      attendance,
      action: "punch_in",
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

    const beforeAttendance = attendance.toObject();
    const hoursWorked = Math.round(((now - attendance.punchIn) / (60 * 60 * 1000)) * 100) / 100;

    attendance.punchOut = now;
    attendance.hoursWorked = hoursWorked;
    attendance.status = getAttendanceStatus(hoursWorked);

    await attendance.save();

    await createAttendanceAuditEvent({
      req,
      attendance,
      action: "punch_out",
      beforeAttendance,
    });

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

const getTeamAttendance = async (req, res) => {
  try {
    const { startDate, endDate, managerId, page = 1, limit = 20 } = req.query;
    const teamManagerId = req.user.role === "manager" ? req.user._id : managerId;
    const teamMembers = await User.find({ managerId: teamManagerId })
      .select("_id name email departmentId")
      .lean();

    const teamMemberIds = teamMembers.map((teamMember) => teamMember._id);
    const skip = (page - 1) * limit;

    if (teamMemberIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Team attendance retrieved successfully",
        data: {
          attendance: [],
          pagination: {
            page,
            limit,
            totalRecords: 0,
            totalPages: 0,
          },
        },
      });
    }

    const filter = { userId: { $in: teamMemberIds } };

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(`${startDate}T00:00:00.000Z`);
      }

      if (endDate) {
        filter.date.$lte = new Date(`${endDate}T00:00:00.000Z`);
      }
    }

    const employeeById = new Map(teamMembers.map((teamMember) => [String(teamMember._id), teamMember]));
    const [attendance, totalRecords] = await Promise.all([
      Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Attendance.countDocuments(filter),
    ]);

    const attendanceWithEmployees = attendance.map((record) => ({
      ...record,
      employee: employeeById.get(String(record.userId)),
    }));

    return res.status(200).json({
      success: true,
      message: "Team attendance retrieved successfully",
      data: {
        attendance: attendanceWithEmployees,
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

const getOrganizationAttendance = async (req, res) => {
  try {
    const { startDate, endDate, status, isLate, departmentId, managerId, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(`${startDate}T00:00:00.000Z`);
      }

      if (endDate) {
        filter.date.$lte = new Date(`${endDate}T00:00:00.000Z`);
      }
    }

    if (status) {
      filter.status = status;
    }

    if (isLate !== undefined) {
      filter.isLate = isLate;
    }

    if (departmentId || managerId) {
      const employeeFilter = {};

      if (departmentId) {
        employeeFilter.departmentId = departmentId;
      }

      if (managerId) {
        employeeFilter.managerId = managerId;
      }

      const matchingEmployees = await User.find(employeeFilter).select("_id").lean();
      const employeeIds = matchingEmployees.map((employee) => employee._id);

      if (employeeIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Organization attendance retrieved successfully",
          data: {
            attendance: [],
            pagination: {
              page,
              limit,
              totalRecords: 0,
              totalPages: 0,
            },
          },
        });
      }

      filter.userId = { $in: employeeIds };
    }

    const skip = (page - 1) * limit;
    const [attendance, totalRecords] = await Promise.all([
      Attendance.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email departmentId managerId")
        .lean(),
      Attendance.countDocuments(filter),
    ]);

    const attendanceWithEmployees = attendance.map((record) => {
      const { userId, ...attendanceRecord } = record;

      return {
        ...attendanceRecord,
        userId: userId?._id || null,
        employee: userId || null,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Organization attendance retrieved successfully",
      data: {
        attendance: attendanceWithEmployees,
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

const correctAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    const beforeAttendance = attendance.toObject();

    const hasPunchIn = Object.prototype.hasOwnProperty.call(req.body, "punchIn");
    const hasPunchOut = Object.prototype.hasOwnProperty.call(req.body, "punchOut");
    const hasTimeCorrection = hasPunchIn || hasPunchOut;

    if (hasTimeCorrection) {
      const correctedPunchIn = hasPunchIn ? new Date(req.body.punchIn) : attendance.punchIn;
      const correctedPunchOut = hasPunchOut ? new Date(req.body.punchOut) : attendance.punchOut;

      if (!correctedPunchIn || !correctedPunchOut) {
        return res.status(400).json({
          success: false,
          message: "Both punch-in and punch-out times are required for a time correction",
        });
      }

      if (correctedPunchOut <= correctedPunchIn) {
        return res.status(400).json({
          success: false,
          message: "Punch-out time must be later than punch-in time",
        });
      }

      const hoursWorked = Math.round(((correctedPunchOut - correctedPunchIn) / (60 * 60 * 1000)) * 100) / 100;

      attendance.punchIn = correctedPunchIn;
      attendance.punchOut = correctedPunchOut;
      attendance.hoursWorked = hoursWorked;
      attendance.status = getAttendanceStatus(hoursWorked);
      attendance.isLate = isLateCheckIn(correctedPunchIn);
    }

    attendance.correctionReason = req.body.correctionReason;

    await attendance.save();

    await createAttendanceAuditEvent({
      req,
      attendance,
      action: "corrected",
      beforeAttendance,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance record corrected successfully",
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
  getTeamAttendance,
  getOrganizationAttendance,
  correctAttendance,
  notImplemented,
};
