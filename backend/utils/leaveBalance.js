const LeaveBalance = require("../models/LeaveBalance");
const LeaveType = require("../models/LeaveType");

const getCurrentLeaveYear = (date = new Date()) => {
  const timezone = process.env.ATTENDANCE_TIMEZONE || "Asia/Kolkata";
  const year = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric" })
    .formatToParts(date)
    .find((part) => part.type === "year");
  return Number(year.value);
};

const initializeLeaveBalancesForUser = async ({ userId, session, year = getCurrentLeaveYear() }) => {
  const existingBalance = await LeaveBalance.exists({ userId, year }).session(session);
  if (existingBalance) return { initialized: false, year };

  const activeLeaveTypes = await LeaveType.find({ isActive: true }).select("_id maxDaysPerYear").session(session).lean();
  if (activeLeaveTypes.length === 0) return { initialized: false, year };

  await LeaveBalance.create(
    activeLeaveTypes.map((leaveType) => ({
      userId,
      leaveTypeId: leaveType._id,
      year,
      allocated: leaveType.maxDaysPerYear,
      used: 0,
    })),
    { 
      session,
      ordered:true,
     }
  );

  return { initialized: true, year };
};

module.exports = { getCurrentLeaveYear, initializeLeaveBalancesForUser };
