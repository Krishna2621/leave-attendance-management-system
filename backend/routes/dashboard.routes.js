const express = require("express");
const { query } = require("express-validator");

const {
  getEmployeeDashboard,
  getTeamDashboard,
  getOrganizationDashboard,
} = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

const rejectQueryParameters = query().custom((value, { req }) => {
  const unexpectedField = Object.keys(req.query)[0];

  if (unexpectedField) {
    throw new Error(`Query parameter '${unexpectedField}' is not allowed`);
  }

  return true;
});

router.use(protect);

router.get("/me", [rejectQueryParameters], validateRequest, getEmployeeDashboard);
router.get("/team", authorizeRoles("manager"), [rejectQueryParameters], validateRequest, getTeamDashboard);
router.get("/organization", authorizeRoles("hr", "admin"), [rejectQueryParameters], validateRequest, getOrganizationDashboard);

module.exports = router;
