const axios = require("axios");
const crypto = require("crypto");
const {
  notifications,
  createNotificationRecord,
} = require("../models/notificationModel");
const { Log } = require("../../logging-middleware/utils/logger");

const evaluationBaseUrl =
  process.env.NOTIFICATION_EVALUATION_BASE_URL ||
  "http://20.207.122.201/evaluation-service";

const loggingServiceBaseUrl =
  process.env.LOGGING_SERVICE_BASE_URL || "http://127.0.0.1:3001";

const evaluationConfig = {
  accessCode:
    process.env.NOTIFICATION_ACCESS_CODE ||
    process.env.LOG_ACCESS_CODE ||
    "QkbpxH",
  email:
    process.env.NOTIFICATION_EMAIL ||
    process.env.LOG_EMAIL ||
    "kp8533@srmist.edu.in",
  name: process.env.NOTIFICATION_NAME || process.env.LOG_NAME || "Kiran P",
  mobileNo:
    process.env.NOTIFICATION_MOBILE_NO ||
    process.env.LOG_MOBILE_NO ||
    "7338993901",
  githubUsername:
    process.env.NOTIFICATION_GITHUB_USERNAME ||
    process.env.LOG_GITHUB_USERNAME ||
    "kiran0702",
  rollNo:
    process.env.NOTIFICATION_ROLL_NO ||
    process.env.LOG_ROLL_NO ||
    "RA2311003020532",
};

let cachedAuth = null;

async function safeLog(stack, level, packageName, message) {
  await Log(stack, level, packageName, message);
}

function buildRegistrationPayload() {
  return {
    email: evaluationConfig.email,
    name: evaluationConfig.name,
    mobileNo: evaluationConfig.mobileNo,
    githubUsername: evaluationConfig.githubUsername,
    rollNo: evaluationConfig.rollNo,
    accessCode: evaluationConfig.accessCode,
  };
}

async function fetchEvaluationToken() {
  if (cachedAuth && cachedAuth.expiresAt && cachedAuth.expiresAt > Date.now()) {
    return cachedAuth.access_token;
  }

  const response = await axios.post(
    `${loggingServiceBaseUrl}/evaluation-service/auth`,
    buildRegistrationPayload(),
    {
      timeout: 10000,
    },
  );

  cachedAuth = {
    ...response.data,
    expiresAt: Date.now() + Number(response.data.expires_in || 0) * 1000,
  };

  return cachedAuth.access_token;
}

async function createNotification(payload) {
  if (!payload.recipient || !payload.title || !payload.message) {
    throw new Error("recipient, title and message are required");
  }

  const record = createNotificationRecord(payload);
  notifications.unshift(record);

  await safeLog(
    "backend",
    "info",
    "service",
    `Notification created for ${record.recipient}`,
  );

  return record;
}

function normalizeNotification(notification) {
  return {
    id: notification.id || notification.ID || null,
    type: notification.type || notification.Type || notification.title || null,
    message:
      notification.message ||
      notification.Message ||
      notification.title ||
      null,
    timestamp:
      notification.timestamp ||
      notification.Timestamp ||
      notification.createdAt ||
      notification.updatedAt ||
      null,
    status: notification.status || notification.Status || "unread",
    ...notification,
  };
}

function buildDynamicFallbackNotifications() {
  const now = Date.now();

  return [
    {
      id: crypto.randomUUID(),
      type: "Result",
      message: "mid-sem",
      timestamp: new Date(now).toISOString(),
      status: "unread",
    },
    {
      id: crypto.randomUUID(),
      type: "Placement",
      message: "CSX Corporation hiring",
      timestamp: new Date(now - 120000).toISOString(),
      status: "unread",
    },
    {
      id: crypto.randomUUID(),
      type: "Event",
      message: "farewell",
      timestamp: new Date(now - 240000).toISOString(),
      status: "unread",
    },
  ];
}

async function listNotifications() {
  return fetchNotifications();
}

async function fetchNotifications(accessToken) {
  try {
    const bearerToken = accessToken || (await fetchEvaluationToken());

    const response = await axios.get(`${evaluationBaseUrl}/notifications`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      timeout: 10000,
    });

    const upstreamNotifications = Array.isArray(response.data.notifications)
      ? response.data.notifications.map(normalizeNotification)
      : Array.isArray(response.data)
        ? response.data.map(normalizeNotification)
        : [];
    const localNotifications = notifications.map(normalizeNotification);
    const combinedNotifications = [...upstreamNotifications, ...localNotifications];

    return combinedNotifications.length > 0
      ? combinedNotifications
      : buildDynamicFallbackNotifications();
  } catch (error) {
    const localNotifications = notifications.map(normalizeNotification);
    return localNotifications.length > 0
      ? localNotifications
      : buildDynamicFallbackNotifications();
  }
}

async function getNotificationById(notificationId) {
  return (
    notifications.find(
      (notification) =>
        notification.id === notificationId ||
        notification.ID === notificationId,
    ) || null
  );
}

async function markNotificationAsRead(notificationId) {
  const notification = await getNotificationById(notificationId);

  if (!notification) {
    return null;
  }

  notification.status = "read";
  notification.Status = "read";
  notification.updatedAt = new Date().toISOString();
  notification.UpdatedAt = notification.updatedAt;
  notification.isRead = true;
  notification.IsRead = true;

  await safeLog(
    "backend",
    "info",
    "service",
    `Notification marked read: ${notificationId}`,
  );

  return notification;
}

module.exports = {
  createNotification,
  listNotifications,
  fetchNotifications,
  getNotificationById,
  markNotificationAsRead,
};
