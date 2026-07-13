const { escapeHtml } = require("./template.utils");
module.exports = ({ recipientName, leaveTypeName, startDate, endDate, totalDays }) => ({
  subject: "Reminder: your leave starts soon",
  text: `Hello ${recipientName}, your approved ${leaveTypeName} leave starts on ${startDate} and ends on ${endDate} (${totalDays} day(s)).`,
  html: `<p>Hello ${escapeHtml(recipientName)},</p><p>Your approved <strong>${escapeHtml(leaveTypeName)}</strong> leave starts on ${escapeHtml(startDate)} and ends on ${escapeHtml(endDate)} (${escapeHtml(totalDays)} day(s)).</p>`,
});
