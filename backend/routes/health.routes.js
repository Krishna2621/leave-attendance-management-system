const express = require("express");
const mongoose = require("mongoose");
const { hasCloudinaryConfig } = require("../config/env");
const { verifyEmailTransport } = require("../services/email.service");

const router = express.Router();
router.get("/live", (req, res) => res.status(200).json({ success: true, message: "Service is live", data: { status: "live", timestamp: new Date().toISOString() } }));
router.get("/ready", async (req, res) => {
  const mongo = mongoose.connection.readyState === 1;
  const cloudinary = hasCloudinaryConfig();
  let smtp = false;
  try { smtp = await verifyEmailTransport(); } catch { smtp = false; }
  const ready = mongo && cloudinary && smtp;
  return res.status(ready ? 200 : 503).json({ success: ready, message: ready ? "Service is ready" : "Service dependencies are not ready", data: { status: ready ? "ready" : "not_ready", timestamp: new Date().toISOString(), checks: { mongodb: mongo ? "ready" : "not_ready", cloudinary: cloudinary ? "configured" : "not_configured", smtp: smtp ? "ready" : "not_ready" } } });
});
module.exports = router;
