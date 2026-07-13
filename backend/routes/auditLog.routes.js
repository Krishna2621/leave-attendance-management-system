const express = require("express");
const { param, query } = require("express-validator");

const { getAttendanceAuditLogs } = require("../controllers/auditLog.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("hr", "admin"));

router.get(
  "/attendance/:attendanceId",
  [
    param("attendanceId").isMongoId().withMessage("Attendance ID must be a valid MongoDB ObjectId"),
    query().custom((value, { req }) => {
      const allowedFields = ["page", "limit"];
      const unexpectedField = Object.keys(req.query).find((field) => !allowedFields.includes(field));

      if (unexpectedField) {
        throw new Error(`Query parameter '${unexpectedField}' is not allowed`);
      }

      return true;
    }),
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer").toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100").toInt(),
  ],
  validateRequest,
  getAttendanceAuditLogs
);

module.exports = router;
