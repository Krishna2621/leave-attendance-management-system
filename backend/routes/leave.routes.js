const express = require("express");

const { notImplemented } = require("../controllers/leave.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);

router.post("/apply", notImplemented);
router.get("/me", notImplemented);
router.get("/team", authorizeRoles("manager"), notImplemented);
router.get("/all", authorizeRoles("hr", "admin"), notImplemented);
router.put("/:id/approve", authorizeRoles("manager", "hr"), notImplemented);
router.put("/:id/reject", authorizeRoles("manager", "hr"), notImplemented);
router.put("/:id/cancel", notImplemented);
router.get("/balance/me", notImplemented);
router.get("/types", notImplemented);

module.exports = router;
