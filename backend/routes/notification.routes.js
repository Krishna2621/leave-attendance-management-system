const express = require("express");
const { param, query } = require("express-validator");
const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");
const { protect } = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();
router.use(protect);
router.get(
  "/me",
  [
    query().custom((value, { req }) => {
      const field = Object.keys(req.query).find((key) => !["page", "limit"].includes(key));
      if (field) throw new Error(`Query parameter '${field}' is not allowed`);
      return true;
    }),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("page must be a positive integer")
      .toInt(),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("limit must be between 1 and 100")
      .toInt(),
  ],
  validateRequest,
  getMyNotifications
);
router.patch("/read-all", markAllNotificationsAsRead);
router.patch(
  "/:id/read",
  [param("id").isMongoId().withMessage("Invalid notification id")],
  validateRequest,
  markNotificationAsRead
);
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid notification id")],
  validateRequest,
  deleteNotification
);
module.exports = router;
