const express = require("express");

const { notImplemented } = require("../controllers/attendance.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);

router.post("/punch-in", notImplemented);
router.post("/punch-out", notImplemented);
router.get("/me", notImplemented);
router.get("/team", authorizeRoles("manager", "hr"), notImplemented);
router.get("/all", authorizeRoles("hr", "admin"), notImplemented);
router.put("/:id/correct", authorizeRoles("hr"), notImplemented);

module.exports = router;
