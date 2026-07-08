const express = require("express");

const { notImplemented } = require("../controllers/report.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("hr", "admin"));

router.get("/attendance", notImplemented);
router.get("/leaves", notImplemented);
router.get("/export", notImplemented);

module.exports = router;
