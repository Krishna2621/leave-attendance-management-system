const express = require("express");
const rateLimit = require("express-rate-limit");
const { body, param } = require("express-validator");

const {
  forgotPassword,
  login,
  logout,
  logoutAll,
  refreshToken,
  resetPassword,
  sendEmployeeOtp,
  verifyEmployeeOtp,
  createEmployee,
  setPassword,
} = require("../controllers/auth.controller");
const { authorizeRoles } = require("../middleware/role.middleware");
const { protect } = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
});
const rejectUnexpectedFields = (allowedFields) =>
  body().custom((value, { req }) => {
    const unexpectedField = Object.keys(req.body).find((field) => !allowedFields.includes(field));
    if (unexpectedField) throw new Error(`Field '${unexpectedField}' is not allowed`);
    return true;
  });
const passwordValidation = (field = "password") =>
  body(field)
    .isString()
    .withMessage("Password must be a string")
    .trim()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters");

router.use(authLimiter);
const employeeCreationValidation = [
  rejectUnexpectedFields(["name", "email", "departmentId", "managerId", "role", "joiningDate"]),
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("departmentId").optional({ nullable: true }).isMongoId(),
  body("managerId").optional({ nullable: true }).isMongoId(),
  body("role").isIn(["employee", "manager", "hr", "admin"]).withMessage("Invalid role"),
  body("joiningDate")
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage("Joining date is required"),
];

router.post(
  "/register",
  protect,
  authorizeRoles("hr", "admin"),
  employeeCreationValidation,
  validateRequest,
  createEmployee
);
router.post(
  "/employees/send-otp",
  protect,
  authorizeRoles("hr", "admin"),
  [
    rejectUnexpectedFields(["email"]),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  ],
  validateRequest,
  sendEmployeeOtp
);
router.post(
  "/employees/verify-otp",
  protect,
  authorizeRoles("hr", "admin"),
  [
    rejectUnexpectedFields(["email", "otp"]),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("otp")
      .matches(/^\d{6}$/)
      .withMessage("Verification code must be 6 digits"),
  ],
  validateRequest,
  verifyEmployeeOtp
);
router.post(
  "/employees",
  protect,
  authorizeRoles("hr", "admin"),
  employeeCreationValidation,
  validateRequest,
  createEmployee
);
router.post(
  "/set-password/:token",
  [
    param("token")
      .matches(/^[a-f0-9]{64}$/i)
      .withMessage("Token is invalid"),
    rejectUnexpectedFields(["password", "confirmPassword"]),
    passwordValidation(),
    body("confirmPassword")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Password confirmation does not match"),
  ],
  validateRequest,
  setPassword
);
router.post(
  "/login",
  [
    rejectUnexpectedFields(["email", "password"]),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    passwordValidation(),
  ],
  validateRequest,
  login
);
router.post("/logout", logout);
router.post("/logout-all", protect, logoutAll);
router.post("/refresh-token", refreshToken);
router.post(
  "/forgot-password",
  [
    rejectUnexpectedFields(["email"]),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  ],
  validateRequest,
  forgotPassword
);
router.post(
  "/reset-password",
  [
    rejectUnexpectedFields(["token", "password", "confirmPassword"]),
    body("token")
      .isString()
      .withMessage("Token must be a string")
      .trim()
      .matches(/^[a-f0-9]{64}$/i)
      .withMessage("Token is invalid"),
    passwordValidation(),
    body("confirmPassword")
      .isString()
      .withMessage("Password confirmation must be a string")
      .trim()
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Password confirmation does not match"),
  ],
  validateRequest,
  resetPassword
);

module.exports = router;
