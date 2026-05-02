const notificationService = require("../services/notificationService");

async function createNotification(req, res, next) {
  try {
    const notification = await notificationService.createNotification(req.body);
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
}

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.fetchNotifications(
      req.authToken,
    );
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
}

async function getNotificationById(req, res, next) {
  try {
    const notification = await notificationService.getNotificationById(
      req.params.id,
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json(notification);
  } catch (error) {
    next(error);
  }
}

async function markNotificationAsRead(req, res, next) {
  try {
    const notification = await notificationService.markNotificationAsRead(
      req.params.id,
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json(notification);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
};
