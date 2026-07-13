const { escapeHtml } = require("./template.utils");
module.exports = ({ recipientName, businessDate }) => ({
  subject: "Reminder: mark your attendance",
  text: `Hello ${recipientName}, you have not marked attendance for ${businessDate}. Please punch in if you are working today.`,
  html: `<p>Hello ${escapeHtml(recipientName)},</p><p>You have not marked attendance for ${escapeHtml(businessDate)}. Please punch in if you are working today.</p>`,
});
