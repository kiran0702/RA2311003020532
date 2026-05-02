const express = require("express");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

router.post("/", notificationController.createNotification);
router.get("/", notificationController.getNotifications);
router.get("/:id", notificationController.getNotificationById);
router.patch("/:id/read", notificationController.markNotificationAsRead);

module.exports = router;
