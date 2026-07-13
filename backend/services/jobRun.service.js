const ScheduledJobRun = require("../models/ScheduledJobRun");

const maxAttempts = Number(process.env.SCHEDULED_JOB_MAX_ATTEMPTS || 3);
const lockMinutes = Number(process.env.SCHEDULED_JOB_LOCK_MINUTES || 30);
const cleanError = (error) => String(error.message || "Scheduled job failed").slice(0, 1000);

const acquireJobRun = async ({ jobName, runKey, metadata = {} }) => {
  const now = new Date();
  const lockUntil = new Date(now.getTime() + lockMinutes * 60000);
  try {
    return await ScheduledJobRun.create({ jobName, runKey, status: "running", lockUntil, attemptCount: 1, startedAt: now, metadata });
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
  const existing = await ScheduledJobRun.findOne({ jobName, runKey }).lean();
  if (!existing || existing.status === "completed" || existing.attemptCount >= maxAttempts) return null;
  return ScheduledJobRun.findOneAndUpdate(
    { _id: existing._id, $or: [{ status: "failed" }, { status: "running", lockUntil: { $lt: now } }] },
    { $set: { status: "running", lockUntil, startedAt: now, completedAt: null, failedAt: null, lastError: "", metadata }, $inc: { attemptCount: 1 } },
    { new: true }
  );
};

const runScheduledJob = async ({ jobName, runKey, metadata, handler }) => {
  const jobRun = await acquireJobRun({ jobName, runKey, metadata });
  if (!jobRun) return { skipped: true, reason: "Job run is already completed, locked, or exhausted retries" };
  const startedAt = Date.now();
  try {
    const result = await handler();
    await ScheduledJobRun.updateOne({ _id: jobRun._id }, { $set: { status: "completed", lockUntil: null, completedAt: new Date(), metadata: { ...metadata, result } } });
    console.log("Scheduled job completed", { jobName, runKey, durationMs: Date.now() - startedAt, result });
    return { skipped: false, result };
  } catch (error) {
    await ScheduledJobRun.updateOne({ _id: jobRun._id }, { $set: { status: "failed", lockUntil: null, failedAt: new Date(), lastError: cleanError(error) } });
    console.error("Scheduled job failed", { jobName, runKey, durationMs: Date.now() - startedAt, error: cleanError(error) });
    throw error;
  }
};

module.exports = { runScheduledJob };
