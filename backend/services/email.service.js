const nodemailer = require("nodemailer");
const { getEmailConfig, getEmailFrom } = require("../config/email");

let transporter;

const getTransporter = () => {
  if (!transporter) transporter = nodemailer.createTransport(getEmailConfig());
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!getEmailFrom()) {
    throw new Error("Email sender is not configured");
  }

  try {
    const info = await getTransporter().sendMail({
      from: getEmailFrom(),
      to,
      subject,
      html,
      text,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("========== EMAIL ERROR ==========");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("Command:", err.command);
    console.error("Response:", err.response);
    console.error("Response Code:", err.responseCode);
    console.error(err);
    console.error("=================================");

    throw err;
  }
};

const verifyEmailTransport = async () => getTransporter().verify();

module.exports = { sendEmail, verifyEmailTransport };
