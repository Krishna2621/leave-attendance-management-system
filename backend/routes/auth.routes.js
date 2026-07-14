const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");

const { forgotPassword, login, logout, logoutAll, refreshToken, register, resetPassword } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many authentication attempts. Please try again later." } });
const rejectUnexpectedFields = (allowedFields) => body().custom((value, { req }) => {
  const unexpectedField = Object.keys(req.body).find((field) => !allowedFields.includes(field));
  if (unexpectedField) throw new Error(`Field '${unexpectedField}' is not allowed`);
  return true;
});
const passwordValidation = (field = "password") => body(field).isString().withMessage("Password must be a string").trim().isLength({ min: 8, max: 128 }).withMessage("Password must be between 8 and 128 characters");

router.use(authLimiter);
router.post("/register", [rejectUnexpectedFields(["name", "email", "password", "confirmPassword", "departmentId", "managerId"]), body("name").trim().notEmpty().withMessage("Name is required"), body("email").isEmail().withMessage("Valid email is required").normalizeEmail(), passwordValidation(), body("confirmPassword").isString().withMessage("Password confirmation must be a string").trim().custom((value, { req }) => value === req.body.password).withMessage("Password confirmation does not match")], validateRequest, register);
router.post("/login", [rejectUnexpectedFields(["email", "password"]), body("email").isEmail().withMessage("Valid email is required").normalizeEmail(), passwordValidation()], validateRequest, login);
router.post("/logout", logout);
router.post("/logout-all", protect, logoutAll);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", [rejectUnexpectedFields(["email"]), body("email").isEmail().withMessage("Valid email is required").normalizeEmail()], validateRequest, forgotPassword);
router.post("/reset-password", [rejectUnexpectedFields(["token", "password", "confirmPassword"]), body("token").isString().withMessage("Token must be a string").trim().matches(/^[a-f0-9]{64}$/i).withMessage("Token is invalid"), passwordValidation(), body("confirmPassword").isString().withMessage("Password confirmation must be a string").trim().custom((value, { req }) => value === req.body.password).withMessage("Password confirmation does not match")], validateRequest, resetPassword);

module.exports = router;
