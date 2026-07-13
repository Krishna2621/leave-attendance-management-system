const leaveTimezone = process.env.ATTENDANCE_TIMEZONE || "Asia/Kolkata";

const getBusinessDate = (date) => {
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: leaveTimezone,
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

const toBusinessDate = (dateString) => new Date(`${dateString}T00:00:00.000Z`);

const getWorkingLeaveDates = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getUTCDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(new Date(currentDate));
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
};

const getLeaveDaysByYear = (leaveDates) => {
  const daysByYear = new Map();

  leaveDates.forEach((date) => {
    const year = date.getUTCFullYear();
    daysByYear.set(year, (daysByYear.get(year) || 0) + 1);
  });

  return Array.from(daysByYear, ([year, days]) => ({ year, days }));
};

module.exports = {
  getBusinessDate,
  toBusinessDate,
  getWorkingLeaveDates,
  getLeaveDaysByYear,
};
