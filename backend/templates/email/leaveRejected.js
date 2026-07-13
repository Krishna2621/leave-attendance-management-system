const { escapeHtml } = require("./template.utils");
module.exports = ({ recipientName, leaveTypeName, startDate, endDate, approverComment }) => ({
  subject: "Your leave request has been rejected",
  text: `Hello ${recipientName}, your ${leaveTypeName} leave from ${startDate} to ${endDate} was rejected. Comment: ${approverComment}`,
  html: `<p>Hello ${escapeHtml(recipientName)},</p><p>Your <strong>${escapeHtml(leaveTypeName)}</strong> leave from ${escapeHtml(startDate)} to ${escapeHtml(endDate)} was rejected.</p><p>Comment: ${escapeHtml(approverComment)}</p>`,
});
