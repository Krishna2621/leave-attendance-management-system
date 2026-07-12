const express = require("express");
const { body, param, query } = require("express-validator");

const {
  punchIn,
  punchOut,
  getAttendanceHistory,
  getTeamAttendance,
  getOrganizationAttendance,
  correctAttendance,
  notImplemented,
} = require("../controllers/attendance.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

router.use(protect);

router.post(
  "/punch-in",
  [
    body().custom((value, { req }) => {
      const allowedFields = ["note"];
      const unexpectedField = Object.keys(req.body).find((field) => !allowedFields.includes(field));

      if (unexpectedField) {
        throw new Error(`Field '${unexpectedField}' is not allowed for punch-in`);
      }

      return true;
    }),
    body("note").optional().isString().withMessage("Note must be a string").trim().isLength({ max: 500 }).withMessage("Note cannot exceed 500 characters"),
  ],
  validateRequest,
  punchIn
);
router.post(
  "/punch-out",
  [
    body().custom((value, { req }) => {
      const unexpectedField = Object.keys(req.body)[0];

      if (unexpectedField) {
        throw new Error(`Field '${unexpectedField}' is not allowed for punch-out`);
      }

      return true;
    }),
  ],
  validateRequest,
  punchOut
);
router.get(
  "/me",
  [
    query().custom((value, { req }) => {
      const allowedFields = ["startDate", "endDate", "page", "limit"];
      const unexpectedField = Object.keys(req.query).find((field) => !allowedFields.includes(field));

      if (unexpectedField) {
        throw new Error(`Query parameter '${unexpectedField}' is not allowed`);
      }

      if (req.query.startDate && req.query.endDate && req.query.startDate > req.query.endDate) {
        throw new Error("startDate cannot be later than endDate");
      }

      return true;
    }),
    query("startDate")
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("startDate must use YYYY-MM-DD format")
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("startDate must be a valid date"),
    query("endDate")
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("endDate must use YYYY-MM-DD format")
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("endDate must be a valid date"),
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer").toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100").toInt(),
  ],
  validateRequest,
  getAttendanceHistory
);
router.get(
  "/team",
  authorizeRoles("manager", "hr"),
  [
    query().custom((value, { req }) => {
      const allowedFields = ["startDate", "endDate", "managerId", "page", "limit"];
      const unexpectedField = Object.keys(req.query).find((field) => !allowedFields.includes(field));

      if (unexpectedField) {
        throw new Error(`Query parameter '${unexpectedField}' is not allowed`);
      }

      if (req.query.startDate && req.query.endDate && req.query.startDate > req.query.endDate) {
        throw new Error("startDate cannot be later than endDate");
      }

      if (req.user.role === "hr" && !req.query.managerId) {
        throw new Error("managerId is required for HR team attendance requests");
      }

      if (req.user.role === "manager" && req.query.managerId) {
        throw new Error("Managers cannot provide a managerId filter");
      }

      return true;
    }),
    query("startDate")
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("startDate must use YYYY-MM-DD format")
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("startDate must be a valid date"),
    query("endDate")
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("endDate must use YYYY-MM-DD format")
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("endDate must be a valid date"),
    query("managerId").optional().isMongoId().withMessage("managerId must be a valid MongoDB ObjectId"),
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer").toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100").toInt(),
  ],
  validateRequest,
  getTeamAttendance
);
router.get(
  "/all",
  authorizeRoles("hr", "admin"),
  [
    query().custom((value, { req }) => {
      const allowedFields = ["startDate", "endDate", "status", "isLate", "departmentId", "managerId", "page", "limit"];
      const unexpectedField = Object.keys(req.query).find((field) => !allowedFields.includes(field));

      if (unexpectedField) {
        throw new Error(`Query parameter '${unexpectedField}' is not allowed`);
      }

      if (req.query.startDate && req.query.endDate && req.query.startDate > req.query.endDate) {
        throw new Error("startDate cannot be later than endDate");
      }

      return true;
    }),
    query("startDate")
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("startDate must use YYYY-MM-DD format")
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("startDate must be a valid date"),
    query("endDate")
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("endDate must use YYYY-MM-DD format")
      .isISO8601({ strict: true, strictSeparator: true })
      .withMessage("endDate must be a valid date"),
    query("status")
      .optional()
      .isIn(["present", "absent", "half-day", "holiday"])
      .withMessage("status must be present, absent, half-day, or holiday"),
    query("isLate").optional().isBoolean({ strict: true }).withMessage("isLate must be true or false").toBoolean(),
    query("departmentId").optional().isMongoId().withMessage("departmentId must be a valid MongoDB ObjectId"),
    query("managerId").optional().isMongoId().withMessage("managerId must be a valid MongoDB ObjectId"),
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer").toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100").toInt(),
  ],
  validateRequest,
  getOrganizationAttendance
);
router.put(
  "/:id/correct",
  authorizeRoles("hr", "admin"),
  [
    param("id").isMongoId().withMessage("Attendance ID must be a valid MongoDB ObjectId"),
    body().custom((value, { req }) => {
      const allowedFields = ["punchIn", "punchOut", "correctionReason"];
      const requestFields = Object.keys(req.body);
      const unexpectedField = requestFields.find((field) => !allowedFields.includes(field));

      if (unexpectedField) {
        throw new Error(`Field '${unexpectedField}' is not allowed for attendance correction`);
      }

      if (typeof req.body.correctionReason !== "string" || !req.body.correctionReason.trim()) {
        throw new Error("Correction reason is required");
      }

      if (!Object.prototype.hasOwnProperty.call(req.body, "punchIn") && !Object.prototype.hasOwnProperty.call(req.body, "punchOut")) {
        throw new Error("At least one punch time is required for an attendance correction");
      }

      return true;
    }),
    body("punchIn").optional().isISO8601({ strict: true }).withMessage("punchIn must be a valid ISO 8601 date-time"),
    body("punchOut").optional().isISO8601({ strict: true }).withMessage("punchOut must be a valid ISO 8601 date-time"),
    body("correctionReason")
      .isString()
      .withMessage("Correction reason must be a string")
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage("Correction reason must be between 1 and 500 characters"),
  ],
  validateRequest,
  correctAttendance
);

module.exports = router;
