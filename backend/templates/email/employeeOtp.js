const { escapeHtml } = require("./template.utils");

module.exports = ({ otp }) => ({
  subject: "Your LeaveFlow email verification code",
  text: `Your LeaveFlow email verification code is ${otp}. It expires in 5 minutes.`,
  html: `<p>Your LeaveFlow email verification code is <strong>${escapeHtml(otp)}</strong>.</p><p>It expires in 5 minutes.</p>`,
});
