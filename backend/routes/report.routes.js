const express = require("express");
const { query } = require("express-validator");

const { getAttendanceReport, notImplemented } = require("../controllers/report.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("hr", "admin"));

router.get(
  "/attendance",
  [
    query().custom((value, { req }) => {
      const allowedFields = ["startDate", "endDate", "departmentId", "managerId", "userId", "status", "isLate"];
      const unexpectedField = Object.keys(req.query).find((field) => !allowedFields.includes(field));

      if (unexpectedField) {
        throw new Error(`Query parameter '${unexpectedField}' is not allowed`);
      }

      if (req.query.startDate && req.query.endDate) {
        const rangeInDays = (new Date(`${req.query.endDate}T00:00:00.000Z`) - new Date(`${req.query.startDate}T00:00:00.000Z`)) / (24 * 60 * 60 * 1000);

        if (rangeInDays < 0) {
          throw new Error("startDate cannot be later than endDate");
        }

        if (rangeInDays > 365) {
          throw new Error("Date range cannot exceed 366 days");
        }
      }

      return true;
    }),
    query("startDate")
      .exists({ checkFalsy: true })
      .withMessage("startDate is required")
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("startDate must use YYYY-MM-DD format")
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("startDate must be a valid date"),
    query("endDate")
      .exists({ checkFalsy: true })
      .withMessage("endDate is required")
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("endDate must use YYYY-MM-DD format")
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("endDate must be a valid date"),
    query("departmentId").optional().isMongoId().withMessage("departmentId must be a valid MongoDB ObjectId"),
    query("managerId").optional().isMongoId().withMessage("managerId must be a valid MongoDB ObjectId"),
    query("userId").optional().isMongoId().withMessage("userId must be a valid MongoDB ObjectId"),
    query("status")
      .optional()
      .isIn(["present", "absent", "half-day", "holiday"])
      .withMessage("status must be present, absent, half-day, or holiday"),
    query("isLate").optional().isBoolean({ strict: true }).withMessage("isLate must be true or false").toBoolean(),
  ],
  validateRequest,
  getAttendanceReport
);
router.get("/leaves", notImplemented);
router.get("/export", notImplemented);

module.exports = router;
