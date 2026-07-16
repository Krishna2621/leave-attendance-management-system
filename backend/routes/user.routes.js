const express = require("express");
const { body, param, query } = require("express-validator");
const controller = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { uploadProfilePicture } = require("../middleware/upload.middleware");
const validateRequest = require("../middleware/validate.middleware");
const router = express.Router();

const roles = ["employee", "manager", "hr", "admin"];
const profileFields = ["name", "phoneNumber", "address", "dateOfBirth", "gender", "emergencyContact", "bloodGroup"];
const allowed = (fields, label) => body().custom((value, { req }) => { const unexpected = Object.keys(req.body).find((key) => !fields.includes(key)); if (unexpected) throw new Error(`Field '${unexpected}' is not allowed for ${label}`); return true; });
const profileValidation = (includeJoining = false) => [
  allowed(includeJoining ? [...profileFields, "joiningDate"] : profileFields, "profile update"),
  body().custom((value, { req }) => { if (!Object.keys(req.body).length) throw new Error("At least one profile field is required"); return true; }),
  body("name").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("phoneNumber").optional().matches(/^\+?[1-9]\d{6,14}$/).withMessage("phoneNumber must be a valid phone number"),
  body("address").optional().isString().trim().isLength({ max: 500 }).withMessage("Address cannot exceed 500 characters"),
  body("dateOfBirth").optional({ nullable: true }).isISO8601({ strict: true, strictSeparator: true }).withMessage("dateOfBirth must be a valid date"),
  body("joiningDate").optional({ nullable: true }).isISO8601({ strict: true, strictSeparator: true }).withMessage("joiningDate must be a valid date"),
  body("gender").optional({ nullable: true }).isIn(["male", "female", "other", "prefer_not_to_say"]).withMessage("Invalid gender"),
  body("bloodGroup").optional({ nullable: true }).isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).withMessage("Invalid blood group"),
  body("emergencyContact").optional().isObject().withMessage("emergencyContact must be an object"),
  body("emergencyContact.name").optional().isString().trim().isLength({ max: 100 }).withMessage("Emergency contact name cannot exceed 100 characters"),
  body("emergencyContact.phoneNumber").optional().matches(/^\+?[1-9]\d{6,14}$/).withMessage("Emergency contact phone number must be valid"),
];
const pagination = [query("page").optional().isInt({ min: 1 }).toInt(), query("limit").optional().isInt({ min: 1, max: 100 }).toInt()];

router.use(protect);
router.get("/me", controller.getMe);
router.put("/me", profileValidation(), validateRequest, controller.updateMyProfile);
router.put("/me/profile-picture", uploadProfilePicture, controller.uploadMyProfilePicture);
router.get("/", authorizeRoles("hr", "admin"), [query("role").optional().isIn(roles), query("departmentId").optional().isMongoId(), query("managerId").optional().isMongoId(), query("isActive").optional().isBoolean({ strict: true }).toBoolean(), query("search").optional().isString().trim().isLength({ max: 100 }), ...pagination], validateRequest, controller.listEmployees);
router.get("/:id", [param("id").isMongoId().withMessage("Employee ID must be a valid MongoDB ObjectId")], validateRequest, controller.getEmployee);
router.put("/:id", authorizeRoles("hr", "admin"), [param("id").isMongoId(), ...profileValidation(true)], validateRequest, controller.updateEmployee);
router.put("/:id/status", authorizeRoles("hr", "admin"), [param("id").isMongoId(), allowed(["isActive"], "status update"), body("isActive").isBoolean({ strict: true }).toBoolean().withMessage("isActive must be true or false")], validateRequest, controller.setActive);
router.put("/:id/manager", authorizeRoles("hr", "admin"), [param("id").isMongoId(), allowed(["managerId"], "manager assignment"), body("managerId").optional({ nullable: true }).isMongoId().withMessage("managerId must be a valid MongoDB ObjectId")], validateRequest, controller.changeManager);
router.put("/:id/department", authorizeRoles("hr", "admin"), [param("id").isMongoId(), allowed(["departmentId"], "department assignment"), body("departmentId").optional({ nullable: true }).isMongoId().withMessage("departmentId must be a valid MongoDB ObjectId")], validateRequest, controller.changeDepartment);
router.put("/:id/role", authorizeRoles("admin"), [param("id").isMongoId(), allowed(["role"], "role change"), body("role").isIn(roles).withMessage("Invalid role")], validateRequest, controller.changeRole);
module.exports = router;
