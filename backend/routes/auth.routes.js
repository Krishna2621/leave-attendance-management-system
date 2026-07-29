const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const { login, changePassword, logout, logoutAll, refreshToken, createEmployee } = require("../controllers/auth.controller");
const { authorizeRoles } = require("../middleware/role.middleware");
const { protect } = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many authentication attempts. Please try again later." } });
const rejectUnexpectedFields = (allowedFields) => body().custom((value, { req }) => {
  const unexpectedField = Object.keys(req.body).find((field) => !allowedFields.includes(field));
  if (unexpectedField) throw new Error(`Field '${unexpectedField}' is not allowed`);
  return true;
});
const passwordValidation = (field) => body(field).isString().withMessage("Password must be a string").trim().isLength({ min: 8, max: 128 }).withMessage("Password must be between 8 and 128 characters");
const employeeCreationValidation = [
  rejectUnexpectedFields(["name", "email", "departmentId", "managerId", "role", "joiningDate"]),
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("departmentId").optional({ nullable: true }).isMongoId(),
  body("managerId").optional({ nullable: true }).isMongoId(),
  body("role").isIn(["employee", "manager", "hr", "admin"]).withMessage("Invalid role"),
  body("joiningDate").isISO8601({ strict: true, strictSeparator: true }).withMessage("Joining date is required"),
];

router.use(authLimiter);
router.post("/employees", protect, authorizeRoles("hr", "admin"), employeeCreationValidation, validateRequest, createEmployee);
router.post("/login", [rejectUnexpectedFields(["email", "password"]), body("email").isEmail().withMessage("Valid email is required").normalizeEmail(), passwordValidation("password")], validateRequest, login);
router.post("/change-password", protect, [rejectUnexpectedFields(["currentPassword", "newPassword", "confirmPassword"]), passwordValidation("currentPassword"), passwordValidation("newPassword"), body("confirmPassword").isString().withMessage("Password confirmation must be a string").trim().custom((value, { req }) => value === req.body.newPassword).withMessage("Password confirmation does not match")], validateRequest, changePassword);
router.post("/logout", logout);
router.post("/logout-all", protect, logoutAll);
router.post("/refresh-token", refreshToken);

module.exports = router;
