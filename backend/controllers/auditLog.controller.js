const AuditLog = require("../models/AuditLog");

const getAttendanceAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = {
      entityType: "attendance",
      entityId: req.params.attendanceId,
    };
    const skip = (page - 1) * limit;

    const [auditLogs, totalRecords] = await Promise.all([
      AuditLog.find(filter)
        .select("_id entityType entityId action actorId actorRole targetUserId changedFields correctionReason source createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Attendance audit logs retrieved successfully",
      data: {
        auditLogs,
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

module.exports = {
  getAttendanceAuditLogs,
};
