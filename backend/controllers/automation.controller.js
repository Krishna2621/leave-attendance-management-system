const {
  runAttendanceAbsenceJob,
  runAttendanceReminderJob,
  runLeaveReminderJob,
} = require("../utils/cronJobs");

const jobs = {
  "attendance-absence": runAttendanceAbsenceJob,
  "attendance-reminder": runAttendanceReminderJob,
  "leave-reminder": runLeaveReminderJob,
};

const runAutomationJob = async (req, res) => {
  try {
    const job = jobs[req.params.jobName];
    if (!job) return res.status(404).json({ success: false, message: "Automation job not found" });
    const result = req.body.targetDate ? await job(req.body.targetDate) : await job();
    return res.status(200).json({
      success: true,
      message: "Automation job executed successfully",
      data: { jobName: req.params.jobName, ...result },
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { runAutomationJob };
