const Attendance = require("../models/Attendance");
const Department = require("../models/Department");
const User = require("../models/User");

const attendanceTimezone = process.env.ATTENDANCE_TIMEZONE || "Asia/Kolkata";

const getBusinessDate = (date) => {
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: attendanceTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const parts = dateParts.reduce((result, part) => {
    if (part.type !== "literal") {
      result[part.type] = Number(part.value);
    }

    return result;
  }, {});

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
};

const emptyAttendanceStatistics = {
  totalAttendanceRecords: 0,
  presentCount: 0,
  absentCount: 0,
  halfDayCount: 0,
  lateCount: 0,
  averageWorkingHours: 0,
};

const buildAttendanceStatisticsPipeline = (match) => [
  { $match: match },
  {
    $group: {
      _id: null,
      totalAttendanceRecords: { $sum: 1 },
      presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
      absentCount: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
      halfDayCount: { $sum: { $cond: [{ $eq: ["$status", "half-day"] }, 1, 0] } },
      lateCount: { $sum: { $cond: ["$isLate", 1, 0] } },
      averageWorkingHours: { $avg: "$hoursWorked" },
    },
  },
  {
    $project: {
      _id: 0,
      totalAttendanceRecords: 1,
      presentCount: 1,
      absentCount: 1,
      halfDayCount: 1,
      lateCount: 1,
      averageWorkingHours: { $round: ["$averageWorkingHours", 2] },
    },
  },
];

const getEmployeeDashboard = async (req, res) => {
  try {
    const today = getBusinessDate(new Date());
    const attendanceFields = "_id date punchIn punchOut status isLate hoursWorked createdAt updatedAt";
    const [statistics, todayAttendance, recentAttendance] = await Promise.all([
      Attendance.aggregate(buildAttendanceStatisticsPipeline({ userId: req.user._id })),
      Attendance.findOne({ userId: req.user._id, date: today }).select(attendanceFields).lean(),
      Attendance.find({ userId: req.user._id }).select(attendanceFields).sort({ date: -1, updatedAt: -1 }).limit(5).lean(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Employee dashboard retrieved successfully",
      data: {
        profile: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          departmentId: req.user.departmentId,
          managerId: req.user.managerId,
          isActive: req.user.isActive,
        },
        todayAttendance,
        ...(statistics[0] || emptyAttendanceStatistics),
        recentAttendance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTeamDashboard = async (req, res) => {
  try {
    const today = getBusinessDate(new Date());
    const teamMembers = await User.find({ managerId: req.user._id, isActive: true })
      .select("_id name departmentId")
      .lean();
    const teamMemberIds = teamMembers.map((teamMember) => teamMember._id);

    if (teamMemberIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Team dashboard retrieved successfully",
        data: {
          teamSize: 0,
          employeesPresentToday: 0,
          employeesAbsentToday: 0,
          employeesLateToday: 0,
          employeesOnHalfDayToday: 0,
          averageTeamWorkingHoursToday: 0,
          recentAttendance: [],
        },
      });
    }

    const teamAttendanceFilter = { userId: { $in: teamMemberIds } };
    const [todayStatistics, recentAttendance] = await Promise.all([
      Attendance.aggregate(buildAttendanceStatisticsPipeline({ ...teamAttendanceFilter, date: today })),
      Attendance.find(teamAttendanceFilter)
        .select("_id userId date punchIn punchOut status isLate hoursWorked createdAt updatedAt")
        .sort({ date: -1, updatedAt: -1 })
        .limit(5)
        .lean(),
    ]);
    const statistics = todayStatistics[0] || emptyAttendanceStatistics;
    const employeeById = new Map(teamMembers.map((teamMember) => [String(teamMember._id), teamMember]));

    return res.status(200).json({
      success: true,
      message: "Team dashboard retrieved successfully",
      data: {
        teamSize: teamMembers.length,
        employeesPresentToday: statistics.presentCount,
        employeesAbsentToday: statistics.absentCount,
        employeesLateToday: statistics.lateCount,
        employeesOnHalfDayToday: statistics.halfDayCount,
        averageTeamWorkingHoursToday: statistics.averageWorkingHours,
        recentAttendance: recentAttendance.map((record) => ({
          ...record,
          employee: employeeById.get(String(record.userId)) || null,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getOrganizationDashboard = async (req, res) => {
  try {
    const today = getBusinessDate(new Date());
    const todayFilter = { date: today };
    const [totalEmployees, activeEmployees, todayStatistics, topDepartmentsByAttendance, recentAttendanceActivities] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      Attendance.aggregate(buildAttendanceStatisticsPipeline(todayFilter)),
      Attendance.aggregate([
        { $match: todayFilter },
        {
          $lookup: {
            from: User.collection.name,
            localField: "userId",
            foreignField: "_id",
            pipeline: [{ $project: { departmentId: 1 } }],
            as: "employee",
          },
        },
        { $unwind: "$employee" },
        { $match: { "employee.departmentId": { $ne: null } } },
        {
          $group: {
            _id: "$employee.departmentId",
            totalAttendanceRecords: { $sum: 1 },
            presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
            halfDayCount: { $sum: { $cond: [{ $eq: ["$status", "half-day"] }, 1, 0] } },
            holidayCount: { $sum: { $cond: [{ $eq: ["$status", "holiday"] }, 1, 0] } },
          },
        },
        {
          $lookup: {
            from: Department.collection.name,
            localField: "_id",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1 } }],
            as: "department",
          },
        },
        { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            department: {
              _id: "$_id",
              name: { $ifNull: ["$department.name", "Unassigned"] },
            },
            attendancePercentage: {
              $cond: [
                { $gt: [{ $subtract: ["$totalAttendanceRecords", "$holidayCount"] }, 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $add: ["$presentCount", { $multiply: ["$halfDayCount", 0.5] }] },
                            { $subtract: ["$totalAttendanceRecords", "$holidayCount"] },
                          ],
                        },
                        100,
                      ],
                    },
                    2,
                  ],
                },
                0,
              ],
            },
          },
        },
        { $sort: { attendancePercentage: -1, "department.name": 1 } },
        { $limit: 5 },
      ]),
      Attendance.aggregate([
        { $sort: { updatedAt: -1, _id: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: User.collection.name,
            localField: "userId",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1, departmentId: 1 } }],
            as: "employee",
          },
        },
        { $unwind: "$employee" },
        {
          $project: {
            _id: 1,
            date: 1,
            punchIn: 1,
            punchOut: 1,
            status: 1,
            isLate: 1,
            hoursWorked: 1,
            createdAt: 1,
            updatedAt: 1,
            employee: {
              _id: "$userId",
              name: "$employee.name",
              departmentId: "$employee.departmentId",
            },
          },
        },
      ]),
    ]);
    const statistics = todayStatistics[0] || emptyAttendanceStatistics;

    return res.status(200).json({
      success: true,
      message: "Organization dashboard retrieved successfully",
      data: {
        totalEmployees,
        activeEmployees,
        employeesPresentToday: statistics.presentCount,
        employeesAbsentToday: statistics.absentCount,
        employeesOnHalfDayToday: statistics.halfDayCount,
        employeesLateToday: statistics.lateCount,
        averageWorkingHoursToday: statistics.averageWorkingHours,
        topDepartmentsByAttendance,
        recentAttendanceActivities,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getEmployeeDashboard,
  getTeamDashboard,
  getOrganizationDashboard,
};
