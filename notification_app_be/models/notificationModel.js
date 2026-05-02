const crypto = require("node:crypto");

const notifications = [];

function createNotificationRecord(payload) {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  return {
    id,
    ID: id,
    Type: payload.type || payload.title || "General",
    Message: payload.message,
    Timestamp: now,
    status: "queued",
    recipient: payload.recipient,
    title: payload.title,
    message: payload.message,
    channel: payload.channel || "email",
    createdAt: now,
    updatedAt: now,
  };
}

module.exports = {
  notifications,
  createNotificationRecord,
};
