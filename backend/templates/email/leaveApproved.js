const { escapeHtml } = require("./template.utils");
module.exports = ({ recipientName, leaveTypeName, startDate, endDate, totalDays, approverComment }) => ({
  subject: "Your leave request has been approved",
  text: `Hello ${recipientName}, your ${leaveTypeName} leave from ${startDate} to ${endDate} (${totalDays} day(s)) has been approved.${approverComment ? ` Comment: ${approverComment}` : ""}`,
  html: `<p>Hello ${escapeHtml(recipientName)},</p><p>Your <strong>${escapeHtml(leaveTypeName)}</strong> leave from ${escapeHtml(startDate)} to ${escapeHtml(endDate)} (${escapeHtml(totalDays)} day(s)) has been approved.</p>${approverComment ? `<p>Comment: ${escapeHtml(approverComment)}</p>` : ""}`,
});
