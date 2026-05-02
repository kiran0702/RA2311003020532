const crypto = require("node:crypto");

const allowedStacks = new Set(["backend", "frontend"]);
const allowedLevels = new Set(["debug", "info", "warn", "error", "fatal"]);
const allowedPackages = new Set([
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
  "utils",
]);

const logs = [];

async function createLogEntry({ stack, level, packageName, message }) {
  const normalizedStack = String(stack || "")
    .trim()
    .toLowerCase();
  const normalizedLevel = String(level || "info")
    .trim()
    .toLowerCase();
  const normalizedPackage = String(packageName || "")
    .trim()
    .toLowerCase();
  const normalizedMessage = String(message || "").trim();

  if (
    !allowedStacks.has(normalizedStack) ||
    !allowedLevels.has(normalizedLevel) ||
    !allowedPackages.has(normalizedPackage) ||
    !normalizedMessage
  ) {
    throw new Error("invalid log payload");
  }

  const entry = {
    id: crypto.randomUUID(),
    stack: normalizedStack,
    level: normalizedLevel,
    package: normalizedPackage,
    message: normalizedMessage,
    createdAt: new Date().toISOString(),
  };

  logs.unshift(entry);

  return entry;
}

async function listLogs() {
  return logs;
}

module.exports = {
  createLogEntry,
  listLogs,
};
