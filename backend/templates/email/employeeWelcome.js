const { escapeHtml } = require("./template.utils");

module.exports = ({ recipientName, setupUrl }) => ({
  subject: "Welcome to LeaveFlow",
  text: `Hello ${recipientName},\n\nYour employee account has been created.\n\nClick the link below to set your password:\n${setupUrl}\n\nThis link expires in 30 minutes.`,
  html: `<p>Hello ${escapeHtml(recipientName)},</p><p>Your employee account has been created.</p><p>Click the link below to set your password.</p><p><a href="${escapeHtml(setupUrl)}">Set your password</a></p><p>This link expires in 30 minutes.</p>`,
});
