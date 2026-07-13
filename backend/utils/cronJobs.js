const cron = require("node-cron");
const { getPreviousBusinessDate, markAutomaticAbsences, queueAttendanceReminders } = require("../services/attendanceAutomation.service");
const { queueLeaveReminders } = require("../services/leaveAutomation.service");
const { dispatchQueuedNotifications } = require("../services/notificationDispatcher.service");
const { runScheduledJob } = require("../services/jobRun.service");
const { getBusinessDate, toBusinessDate } = require("./leave.utils");
const timezone = process.env.CRON_TIMEZONE || process.env.ATTENDANCE_TIMEZONE || "Asia/Kolkata";
const dateKey = (date) => date.toISOString().slice(0, 10);
const minuteKey = (date) => date.toISOString().slice(0, 16);
const resolveDate = (value, fallback) => (typeof value === "string" ? toBusinessDate(value) : value || fallback);

const runAttendanceAbsenceJob = (targetDate) => { const date = resolveDate(targetDate, getPreviousBusinessDate()); return runScheduledJob({ jobName: "attendance-absence", runKey: dateKey(date), metadata: { targetDate: dateKey(date) }, handler: () => markAutomaticAbsences({ targetDate: date }) }); };
const runAttendanceReminderJob = (targetDate) => { const date = resolveDate(targetDate, getBusinessDate(new Date())); return runScheduledJob({ jobName: "attendance-reminder", runKey: dateKey(date), metadata: { targetDate: dateKey(date) }, handler: () => queueAttendanceReminders({ targetDate: date }) }); };
const runLeaveReminderJob = (targetDate) => { const date = resolveDate(targetDate, getBusinessDate(new Date())); return runScheduledJob({ jobName: "leave-reminder", runKey: dateKey(date), metadata: { targetDate: dateKey(date) }, handler: () => queueLeaveReminders({ targetDate: date }) }); };
const runNotificationDispatchJob = () => { const now = new Date(); return runScheduledJob({ jobName: "notification-dispatch", runKey: minuteKey(now), metadata: { startedAt: now.toISOString() }, handler: () => dispatchQueuedNotifications() }); };
const schedule = (expression, name, handler) => cron.schedule(expression, () => handler().catch((error) => console.error("Scheduled job execution failed", { jobName: name, error: error.message })), { timezone });

const startCronJobs = () => {
  if (process.env.CRON_ENABLED === "false") { console.log("Cron jobs are disabled"); return []; }
  const jobs = [
    schedule(process.env.ABSENCE_CRON_SCHEDULE || "15 0 * * *", "attendance-absence", runAttendanceAbsenceJob),
    schedule(process.env.ATTENDANCE_REMINDER_CRON_SCHEDULE || "0 11 * * 1-5", "attendance-reminder", runAttendanceReminderJob),
    schedule(process.env.LEAVE_REMINDER_CRON_SCHEDULE || "0 8 * * *", "leave-reminder", runLeaveReminderJob),
    schedule(process.env.NOTIFICATION_DISPATCH_CRON_SCHEDULE || "* * * * *", "notification-dispatch", runNotificationDispatchJob),
  ];
  console.log("Cron jobs registered", { timezone, count: jobs.length });
  return jobs;
};

module.exports = startCronJobs;
module.exports.runAttendanceAbsenceJob = runAttendanceAbsenceJob;
module.exports.runAttendanceReminderJob = runAttendanceReminderJob;
module.exports.runLeaveReminderJob = runLeaveReminderJob;
module.exports.runNotificationDispatchJob = runNotificationDispatchJob;
