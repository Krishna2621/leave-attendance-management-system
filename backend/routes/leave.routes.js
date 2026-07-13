const express = require("express");
const { body, param, query } = require("express-validator");

const {
  allocateLeaveBalance,
  applyForLeave,
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveType,
  getLeaveBalances,
  getLeaveRequestHistory,
  getLeaveTypes,
  getMyLeaveBalances,
  getMyLeaveRequests,
  getOrganizationLeaveRequests,
  getTeamLeaveRequests,
  rejectLeaveRequest,
  updateLeaveType,
} = require("../controllers/leave.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

const validateAllowedBodyFields = (allowedFields, action) =>
  body().custom((value, { req }) => {
    const unexpectedField = Object.keys(req.body).find((field) => !allowedFields.includes(field));

    if (unexpectedField) {
      throw new Error(`Field '${unexpectedField}' is not allowed for ${action}`);
    }

    return true;
  });

const validateLeaveQuery = (allowedFields) =>
  query().custom((value, { req }) => {
    const unexpectedField = Object.keys(req.query).find((field) => !allowedFields.includes(field));

    if (unexpectedField) {
      throw new Error(`Query parameter '${unexpectedField}' is not allowed`);
    }

    if (req.query.startDate && req.query.endDate && req.query.startDate > req.query.endDate) {
      throw new Error("startDate cannot be later than endDate");
    }

    return true;
  });

const dateValidation = (field) =>
  query(field)
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage(`${field} must use YYYY-MM-DD format`)
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage(`${field} must be a valid date`);

const paginationValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100").toInt(),
];

const leaveRequestQueryValidation = (allowUserId = false) => [
  validateLeaveQuery(["status", "startDate", "endDate", "page", "limit", ...(allowUserId ? ["userId"] : [])]),
  query("status").optional().isIn(["pending", "approved", "rejected", "cancelled"]).withMessage("status must be pending, approved, rejected, or cancelled"),
  dateValidation("startDate"),
  dateValidation("endDate"),
  ...(allowUserId ? [query("userId").optional().isMongoId().withMessage("userId must be a valid MongoDB ObjectId")] : []),
  ...paginationValidation,
];

router.use(protect);

router.get(
  "/types",
  [
    query().custom((value, { req }) => {
      const unexpectedField = Object.keys(req.query).find((field) => field !== "includeInactive");

      if (unexpectedField) {
        throw new Error(`Query parameter '${unexpectedField}' is not allowed`);
      }

      return true;
    }),
    query("includeInactive").optional().isBoolean({ strict: true }).withMessage("includeInactive must be true or false").toBoolean(),
  ],
  validateRequest,
  getLeaveTypes
);
router.post(
  "/types",
  authorizeRoles("hr", "admin"),
  [
    validateAllowedBodyFields(["name", "description", "maxDaysPerYear", "carryForward"], "leave type creation"),
    body("name").isString().withMessage("Name must be a string").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
    body("description").optional().isString().withMessage("Description must be a string").trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
    body("maxDaysPerYear").isFloat({ min: 0, max: 366 }).withMessage("maxDaysPerYear must be between 0 and 366").toFloat(),
    body("carryForward").optional().isBoolean({ strict: true }).withMessage("carryForward must be true or false").toBoolean(),
  ],
  validateRequest,
  createLeaveType
);
router.put(
  "/types/:id",
  authorizeRoles("hr", "admin"),
  [
    param("id").isMongoId().withMessage("Leave type ID must be a valid MongoDB ObjectId"),
    validateAllowedBodyFields(["name", "description", "maxDaysPerYear", "carryForward", "isActive"], "leave type update"),
    body().custom((value, { req }) => {
      if (Object.keys(req.body).length === 0) {
        throw new Error("At least one leave type field is required");
      }

      return true;
    }),
    body("name").optional().isString().withMessage("Name must be a string").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
    body("description").optional().isString().withMessage("Description must be a string").trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
    body("maxDaysPerYear").optional().isFloat({ min: 0, max: 366 }).withMessage("maxDaysPerYear must be between 0 and 366").toFloat(),
    body("carryForward").optional().isBoolean({ strict: true }).withMessage("carryForward must be true or false").toBoolean(),
    body("isActive").optional().isBoolean({ strict: true }).withMessage("isActive must be true or false").toBoolean(),
  ],
  validateRequest,
  updateLeaveType
);

router.get(
  "/balance/me",
  [
    query().custom((value, { req }) => {
      const unexpectedField = Object.keys(req.query).find((field) => field !== "year");

      if (unexpectedField) {
        throw new Error(`Query parameter '${unexpectedField}' is not allowed`);
      }

      return true;
    }),
    query("year").optional().isInt({ min: 2000, max: 2100 }).withMessage("year must be between 2000 and 2100").toInt(),
  ],
  validateRequest,
  getMyLeaveBalances
);
router.get(
  "/balances",
  authorizeRoles("hr", "admin"),
  [
    query().custom((value, { req }) => {
      const allowedFields = ["userId", "year"];
      const unexpectedField = Object.keys(req.query).find((field) => !allowedFields.includes(field));

      if (unexpectedField) {
        throw new Error(`Query parameter '${unexpectedField}' is not allowed`);
      }

      return true;
    }),
    query("userId").isMongoId().withMessage("userId must be a valid MongoDB ObjectId"),
    query("year").optional().isInt({ min: 2000, max: 2100 }).withMessage("year must be between 2000 and 2100").toInt(),
  ],
  validateRequest,
  getLeaveBalances
);
router.post(
  "/balances/allocate",
  authorizeRoles("hr", "admin"),
  [
    validateAllowedBodyFields(["userId", "leaveTypeId", "year", "allocated"], "leave balance allocation"),
    body("userId").isMongoId().withMessage("userId must be a valid MongoDB ObjectId"),
    body("leaveTypeId").isMongoId().withMessage("leaveTypeId must be a valid MongoDB ObjectId"),
    body("year").isInt({ min: 2000, max: 2100 }).withMessage("year must be between 2000 and 2100").toInt(),
    body("allocated").isFloat({ min: 0, max: 366 }).withMessage("allocated must be between 0 and 366").toFloat(),
  ],
  validateRequest,
  allocateLeaveBalance
);

router.post(
  "/apply",
  [
    validateAllowedBodyFields(["leaveTypeId", "startDate", "endDate", "reason", "documentUrl"], "leave application"),
    body().custom((value, { req }) => {
      if (req.body.startDate && req.body.endDate && req.body.startDate > req.body.endDate) {
        throw new Error("startDate cannot be later than endDate");
      }

      const rangeInDays = (new Date(`${req.body.endDate}T00:00:00.000Z`) - new Date(`${req.body.startDate}T00:00:00.000Z`)) / (24 * 60 * 60 * 1000);

      if (rangeInDays > 89) {
        throw new Error("Leave request cannot exceed 90 calendar days");
      }

      return true;
    }),
    body("leaveTypeId").isMongoId().withMessage("leaveTypeId must be a valid MongoDB ObjectId"),
    body("startDate").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("startDate must use YYYY-MM-DD format").isISO8601({ strict: true, strictSeparator: true }).withMessage("startDate must be a valid date"),
    body("endDate").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("endDate must use YYYY-MM-DD format").isISO8601({ strict: true, strictSeparator: true }).withMessage("endDate must be a valid date"),
    body("reason").isString().withMessage("Reason must be a string").trim().isLength({ min: 5, max: 500 }).withMessage("Reason must be between 5 and 500 characters"),
    body("documentUrl").optional().isURL({ protocols: ["http", "https"], require_protocol: true }).withMessage("documentUrl must be a valid HTTP(S) URL"),
  ],
  validateRequest,
  applyForLeave
);
router.get("/me", leaveRequestQueryValidation(), validateRequest, getMyLeaveRequests);
router.get("/team", authorizeRoles("manager"), leaveRequestQueryValidation(), validateRequest, getTeamLeaveRequests);
router.get("/all", authorizeRoles("hr", "admin"), leaveRequestQueryValidation(true), validateRequest, getOrganizationLeaveRequests);
router.get(
  "/:id/history",
  [param("id").isMongoId().withMessage("Leave request ID must be a valid MongoDB ObjectId")],
  validateRequest,
  getLeaveRequestHistory
);
router.put(
  "/:id/approve",
  authorizeRoles("manager", "hr", "admin"),
  [
    param("id").isMongoId().withMessage("Leave request ID must be a valid MongoDB ObjectId"),
    validateAllowedBodyFields(["approverComment"], "leave approval"),
    body("approverComment").optional().isString().withMessage("Approver comment must be a string").trim().isLength({ max: 500 }).withMessage("Approver comment cannot exceed 500 characters"),
  ],
  validateRequest,
  approveLeaveRequest
);
router.put(
  "/:id/reject",
  authorizeRoles("manager", "hr", "admin"),
  [
    param("id").isMongoId().withMessage("Leave request ID must be a valid MongoDB ObjectId"),
    validateAllowedBodyFields(["approverComment"], "leave rejection"),
    body("approverComment").isString().withMessage("Approver comment must be a string").trim().isLength({ min: 1, max: 500 }).withMessage("Approver comment must be between 1 and 500 characters"),
  ],
  validateRequest,
  rejectLeaveRequest
);
router.put(
  "/:id/cancel",
  [
    param("id").isMongoId().withMessage("Leave request ID must be a valid MongoDB ObjectId"),
    validateAllowedBodyFields([], "leave cancellation"),
  ],
  validateRequest,
  cancelLeaveRequest
);

module.exports = router;
