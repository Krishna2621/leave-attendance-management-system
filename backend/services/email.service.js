const nodemailer = require("nodemailer");
const { getEmailConfig, getEmailFrom } = require("../config/email");

let transporter;

const getTransporter = () => {
  if (!transporter) transporter = nodemailer.createTransport(getEmailConfig());
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!getEmailFrom()) throw new Error("Email sender is not configured");
  return getTransporter().sendMail({ from: getEmailFrom(), to, subject, html, text });
};

module.exports = { sendEmail };
