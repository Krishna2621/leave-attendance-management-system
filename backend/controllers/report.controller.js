const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Department = require("../models/Department");
const User = require("../models/User");

const buildMetricsGroupStage = (id) => ({
  $group: {
    _id: id,
    totalRecords: { $sum: 1 },
    presentDays: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
    absentDays: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
    halfDays: { $sum: { $cond: [{ $eq: ["$status", "half-day"] }, 1, 0] } },
    holidayDays: { $sum: { $cond: [{ $eq: ["$status", "holiday"] }, 1, 0] } },
    lateArrivals: { $sum: { $cond: ["$isLate", 1, 0] } },
    totalHoursWorked: { $sum: "$hoursWorked" },
  },
});

const buildMetricsProjectStage = (additionalFields = {}) => ({
  $project: {
    _id: 0,
    ...additionalFields,
    totalRecords: 1,
    presentDays: 1,
    absentDays: 1,
    halfDays: 1,
    holidayDays: 1,
    lateArrivals: 1,
    totalHoursWorked: { $round: ["$totalHoursWorked", 2] },
    averageHoursWorked: { $round: [{ $divide: ["$totalHoursWorked", "$totalRecords"] }, 2] },
    effectivePresentDays: { $add: ["$presentDays", { $multiply: ["$halfDays", 0.5] }] },
    attendanceRate: {
      $cond: [
        { $gt: [{ $subtract: ["$totalRecords", "$holidayDays"] }, 0] },
        {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    { $add: ["$presentDays", { $multiply: ["$halfDays", 0.5] }] },
                    { $subtract: ["$totalRecords", "$holidayDays"] },
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
});

const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, departmentId, managerId, userId, status, isLate } = req.query;
    const filter = {
      date: {
        $gte: new Date(`${startDate}T00:00:00.000Z`),
        $lte: new Date(`${endDate}T00:00:00.000Z`),
      },
    };

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
      const matchingEmployeeIds = matchingEmployees.map((employee) => employee._id);

      filter.userId = userId
        ? { $in: matchingEmployeeIds.filter((employeeId) => String(employeeId) === userId) }
        : { $in: matchingEmployeeIds };
    } else if (userId) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    const report = await Attendance.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: User.collection.name,
          localField: "userId",
          foreignField: "_id",
          pipeline: [{ $project: { departmentId: 1, managerId: 1 } }],
          as: "employee",
        },
      },
      { $unwind: "$employee" },
      {
        $facet: {
          overallSummary: [buildMetricsGroupStage(null), buildMetricsProjectStage()],
          departmentWise: [
            buildMetricsGroupStage("$employee.departmentId"),
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
            buildMetricsProjectStage({
              department: {
                _id: "$_id",
                name: { $ifNull: ["$department.name", "Unassigned"] },
              },
            }),
            { $sort: { "department.name": 1 } },
          ],
          managerWise: [
            buildMetricsGroupStage("$employee.managerId"),
            {
              $lookup: {
                from: User.collection.name,
                localField: "_id",
                foreignField: "_id",
                pipeline: [{ $project: { name: 1 } }],
                as: "manager",
              },
            },
            { $unwind: { path: "$manager", preserveNullAndEmptyArrays: true } },
            buildMetricsProjectStage({
              manager: {
                _id: "$_id",
                name: { $ifNull: ["$manager.name", "Unassigned"] },
              },
            }),
            { $sort: { "manager.name": 1 } },
          ],
          dailyTrend: [
            buildMetricsGroupStage("$date"),
            buildMetricsProjectStage({
              date: { $dateToString: { date: "$_id", format: "%Y-%m-%d", timezone: "UTC" } },
            }),
            { $sort: { date: 1 } },
          ],
        },
      },
    ]);

    const emptySummary = {
      totalRecords: 0,
      presentDays: 0,
      absentDays: 0,
      halfDays: 0,
      holidayDays: 0,
      lateArrivals: 0,
      totalHoursWorked: 0,
      averageHoursWorked: 0,
      effectivePresentDays: 0,
      attendanceRate: 0,
    };
    const reportData = report[0] || {};

    return res.status(200).json({
      success: true,
      message: "Attendance report generated successfully",
      data: {
        generatedAt: new Date(),
        filters: {
          startDate,
          endDate,
          departmentId: departmentId || null,
          managerId: managerId || null,
          userId: userId || null,
          status: status || null,
          isLate: isLate ?? null,
        },
        rateBasis: "recorded_attendance_records",
        overallSummary: reportData.overallSummary?.[0] || emptySummary,
        departmentWise: reportData.departmentWise || [],
        managerWise: reportData.managerWise || [],
        dailyTrend: reportData.dailyTrend || [],
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
      message: "Report APIs are scheduled for Phase 4",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAttendanceReport,
  notImplemented,
};
