const AuditLog = require("../models/AuditLog");

const auditableAttendanceFields = [
  "punchIn",
  "punchOut",
  "status",
  "isLate",
  "hoursWorked",
  "note",
  "correctionReason",
];

const valuesAreEqual = (firstValue, secondValue) => {
  if (firstValue instanceof Date && secondValue instanceof Date) {
    return firstValue.getTime() === secondValue.getTime();
  }

  return firstValue === secondValue;
};

const buildAttendanceChangedFields = (beforeAttendance = {}, afterAttendance = {}) => {
  const changedFields = {};

  auditableAttendanceFields.forEach((field) => {
    const beforeValue = beforeAttendance[field] ?? null;
    const afterValue = afterAttendance[field] ?? null;

    if (!valuesAreEqual(beforeValue, afterValue)) {
      changedFields[field] = {
        before: beforeValue,
        after: afterValue,
      };
    }
  });

  return changedFields;
};

const createAttendanceAuditLog = async ({
  attendanceId,
  action,
  actor = null,
  targetUserId,
  beforeAttendance = {},
  afterAttendance = {},
  correctionReason = "",
  source = "api",
  ipAddress = null,
  userAgent = null,
}) => {
  const changedFields = buildAttendanceChangedFields(beforeAttendance, afterAttendance);
  const normalizedCorrectionReason = typeof correctionReason === "string" ? correctionReason.trim() : "";

  if (Object.keys(changedFields).length === 0) {
    throw new Error("An audit log requires at least one changed attendance field");
  }

  if (action === "corrected" && !normalizedCorrectionReason) {
    throw new Error("A correction audit log requires a correction reason");
  }

  return AuditLog.create({
    entityType: "attendance",
    entityId: attendanceId,
    action,
    actorId: actor?._id || null,
    actorRole: actor?.role || null,
    targetUserId,
    changedFields,
    correctionReason: normalizedCorrectionReason,
    source,
    ipAddress,
    userAgent,
  });
};

module.exports = {
  auditableAttendanceFields,
  buildAttendanceChangedFields,
  createAttendanceAuditLog,
};
