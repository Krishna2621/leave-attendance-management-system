const express = require("express");
const { query } = require("express-validator");
const { getMyNotifications, testNotificationEmail } = require("../controllers/notification.controller");
const { protect } = require("../middleware/auth.middleware");
const developmentOnly = require("../middleware/developmentOnly.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();
router.use(protect);
router.get("/me", [query().custom((value, { req }) => { const field = Object.keys(req.query).find((key) => !["page", "limit"].includes(key)); if (field) throw new Error(`Query parameter '${field}' is not allowed`); return true; }), query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer").toInt(), query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100").toInt()], validateRequest, getMyNotifications);
router.post("/test", developmentOnly, testNotificationEmail);
module.exports = router;
