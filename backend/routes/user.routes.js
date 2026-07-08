const express = require("express");

const {
  deleteUser,
  getMe,
  getUserById,
  getUsers,
  updateUser,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);

router.get("/me", getMe);
router.get("/", authorizeRoles("admin", "hr"), getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", authorizeRoles("admin"), deleteUser);

module.exports = router;
