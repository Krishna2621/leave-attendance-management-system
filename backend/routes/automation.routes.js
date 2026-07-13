const express = require("express");
const { body, param } = require("express-validator");
const { runAutomationJob } = require("../controllers/automation.controller");
const { protect } = require("../middleware/auth.middleware");
const developmentOnly = require("../middleware/developmentOnly.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();
router.use(protect);
router.use(authorizeRoles("admin"));
router.use(developmentOnly);
router.post("/run/:jobName", [param("jobName").isIn(["attendance-absence", "attendance-reminder", "leave-reminder", "notification-dispatch"]).withMessage("Unsupported automation job"), body().custom((value, { req }) => { const field = Object.keys(req.body).find((key) => key !== "targetDate"); if (field) throw new Error(`Field '${field}' is not allowed`); return true; }), body("targetDate").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("targetDate must use YYYY-MM-DD format").isISO8601({ strict: true, strictSeparator: true }).withMessage("targetDate must be a valid date")], validateRequest, runAutomationJob);
module.exports = router;
