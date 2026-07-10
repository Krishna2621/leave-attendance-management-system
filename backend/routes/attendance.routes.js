const express = require("express");
const { body, query } = require("express-validator");

const { punchIn, punchOut, getAttendanceHistory, notImplemented } = require("../controllers/attendance.controller");
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
router.get("/team", authorizeRoles("manager", "hr"), notImplemented);
router.get("/all", authorizeRoles("hr", "admin"), notImplemented);
router.put("/:id/correct", authorizeRoles("hr"), notImplemented);

module.exports = router;
