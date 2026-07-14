const { escapeHtml } = require("./template.utils");

module.exports = ({ recipientName, resetUrl }) => ({
  subject: "Reset your password",
  text: `Hello ${recipientName}, use this link to reset your password: ${resetUrl}\n\nThis link expires in 20 minutes. If you did not request this, you can ignore this email.`,
  html: `<p>Hello ${escapeHtml(recipientName)},</p><p>Use the link below to reset your password. It expires in 20 minutes.</p><p><a href="${escapeHtml(resetUrl)}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
});
