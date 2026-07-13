const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { createAttendanceAuditLog } = require("../utils/auditLog");
const { getBusinessDate, toBusinessDate } = require("../utils/leave.utils");
const { queueNotifications } = require("./notification.service");

const formatDate = (date) => date.toISOString().slice(0, 10);
const isNonWorkingDay = (date) => [0, 6].includes(date.getUTCDay());
const getPreviousBusinessDate = () => { const date = getBusinessDate(new Date()); date.setUTCDate(date.getUTCDate() - 1); return date; };

const markAutomaticAbsences = async ({ targetDate = getPreviousBusinessDate() } = {}) => {
  const businessDate = typeof targetDate === "string" ? toBusinessDate(targetDate) : targetDate;
  if (isNonWorkingDay(businessDate)) return { skipped: true, reason: "Target date is a non-working day", targetDate: formatDate(businessDate), createdCount: 0 };
  const activeEmployees = await User.find({ isActive: true }).select("_id").lean();
  const employeeIds = activeEmployees.map((employee) => employee._id);
  if (!employeeIds.length) return { skipped: false, targetDate: formatDate(businessDate), createdCount: 0 };
  const existing = await Attendance.find({ userId: { $in: employeeIds }, date: businessDate }).select("userId").lean();
  const existingIds = new Set(existing.map((record) => String(record.userId)));
  const missing = employeeIds.filter((id) => !existingIds.has(String(id)));
  if (!missing.length) return { skipped: false, targetDate: formatDate(businessDate), createdCount: 0 };
  const session = await mongoose.startSession();
  let created = [];
  try {
    await session.withTransaction(async () => {
      const raceCheck = await Attendance.find({ userId: { $in: missing }, date: businessDate }).select("userId").session(session).lean();
      const raceIds = new Set(raceCheck.map((record) => String(record.userId)));
      const toCreate = missing.filter((id) => !raceIds.has(String(id)));
      created = await Attendance.insertMany(toCreate.map((userId) => ({userId,
      date: businessDate,status: "absent",isLate: false,hoursWorked: 0,note: "",})),{ session });await Promise.all(created.map((attendance) => createAttendanceAuditLog({ attendanceId: attendance._id, action: "absence_marked", targetUserId: attendance.userId, beforeAttendance: {}, afterAttendance: attendance.toObject(), source: "cron", session })));
    });
  } finally { await session.endSession(); }
  return { skipped: false, targetDate: formatDate(businessDate), createdCount: created.length };
};

const queueAttendanceReminders = async ({ targetDate = getBusinessDate(new Date()) } = {}) => {
  const businessDate = typeof targetDate === "string" ? toBusinessDate(targetDate) : targetDate;
  if (isNonWorkingDay(businessDate)) return { skipped: true, reason: "Target date is a non-working day", queuedCount: 0 };
  const employees = await User.find({ isActive: true }).select("_id").lean();
  const ids = employees.map((employee) => employee._id);
  const existing = await Attendance.find({ userId: { $in: ids }, date: businessDate }).select("userId").lean();
  const existingIds = new Set(existing.map((record) => String(record.userId)));
  const date = formatDate(businessDate);
  return queueNotifications(ids.filter((id) => !existingIds.has(String(id))).map((recipientId) => ({ recipientId, channel: "email", type: "attendance_reminder", referenceType: "Attendance", template: "attendance_reminder", payload: { businessDate: date }, metadata: { source: "cron" }, dedupeKey: `attendance-reminder:${recipientId}:${date}`, scheduledFor: new Date(), nextAttemptAt: new Date() })));
};

module.exports = { getPreviousBusinessDate, markAutomaticAbsences, queueAttendanceReminders };
