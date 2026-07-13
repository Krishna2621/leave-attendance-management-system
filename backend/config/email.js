const getEmailConfig = () => {
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    };
  }

  return {
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  };
};

const getEmailFrom = () => process.env.EMAIL_FROM || process.env.EMAIL_USER;

module.exports = { getEmailConfig, getEmailFrom };
