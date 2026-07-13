const LeaveRequest = require("../models/LeaveRequest");
const { getBusinessDate, toBusinessDate } = require("../utils/leave.utils");
const { queueNotifications } = require("./notification.service");

const formatDate = (date) => date.toISOString().slice(0, 10);
const queueLeaveReminders = async ({ targetDate = getBusinessDate(new Date()) } = {}) => {
  const businessDate = typeof targetDate === "string" ? toBusinessDate(targetDate) : targetDate;
  const reminderDays = Number(process.env.LEAVE_REMINDER_DAYS || 1);
  const startDate = new Date(businessDate);
  startDate.setUTCDate(startDate.getUTCDate() + reminderDays);
  const requests = await LeaveRequest.find({ status: "approved", startDate }).select("_id userId leaveTypeId startDate endDate totalDays").populate("leaveTypeId", "name").lean();
  const runDate = formatDate(businessDate);
  return queueNotifications(requests.map((request) => ({ recipientId: request.userId, channel: "email", type: "leave_reminder", referenceType: "LeaveRequest", referenceId: request._id, template: "leave_reminder", payload: { leaveTypeName: request.leaveTypeId?.name || "Leave", startDate: formatDate(request.startDate), endDate: formatDate(request.endDate), totalDays: request.totalDays }, metadata: { source: "cron", reminderDate: runDate }, dedupeKey: `leave-reminder:${request._id}:${runDate}`, scheduledFor: new Date(), nextAttemptAt: new Date() })));
};

module.exports = { queueLeaveReminders };
