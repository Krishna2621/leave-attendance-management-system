const express = require("express");
const { body } = require("express-validator");

const { punchIn, punchOut, notImplemented } = require("../controllers/attendance.controller");
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
router.get("/me", notImplemented);
router.get("/team", authorizeRoles("manager", "hr"), notImplemented);
router.get("/all", authorizeRoles("hr", "admin"), notImplemented);
router.put("/:id/correct", authorizeRoles("hr"), notImplemented);

module.exports = router;
