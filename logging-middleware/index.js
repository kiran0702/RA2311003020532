const express = require("express");
const config = require("./config/config");
const {
  registerClient,
  authenticateClient,
  verifyToken,
} = require("./services/authService");
const { createLogEntry, listLogs } = require("./services/logService");
const { Log } = require("./utils/logger");

const app = express();

app.use(express.json());

function extractBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

async function requireBearerAuth(req, res, next) {
  const token = extractBearerToken(req);
  const record = token ? await verifyToken(token) : null;

  if (!record) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.auth = record;
  return next();
}

app.get("/health", async (req, res) => {
  res.json({ status: "ok" });
});

app.post("/", async (req, res, next) => {
  try {
    const result = await registerClient(req.body);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/evaluation-service/register", async (req, res, next) => {
  try {
    const result = await registerClient(req.body);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/evaluation-service/auth", async (req, res, next) => {
  try {
    const result = await authenticateClient(req.body);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post(
  "/evaluation-service/logs",
  requireBearerAuth,
  async (req, res, next) => {
    try {
      const entry = await createLogEntry({
        stack: req.body.stack,
        level: req.body.level,
        packageName: req.body.package,
        message: req.body.message,
      });

      await Log(
        req.body.stack,
        req.body.level,
        req.body.package,
        req.body.message,
      );

      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  },
);

app.post("/api/register", async (req, res, next) => {
  try {
    const result = await registerClient(req.body);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth", async (req, res, next) => {
  try {
    const result = await authenticateClient(req.body);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/log", requireBearerAuth, async (req, res, next) => {
  try {
    const entry = await createLogEntry({
      stack: req.body.stack,
      level: req.body.level,
      packageName: req.body.package,
      message: req.body.message,
    });

    await Log(
      req.body.stack,
      req.body.level,
      req.body.package,
      req.body.message,
    );

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

app.get("/api/logs", requireBearerAuth, async (req, res, next) => {
  try {
    const entries = await listLogs();
    res.json({ logs: entries });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  res.status(500).json({ message: error.message || "Internal Server Error" });
});

if (require.main === module) {
  const server = app.listen(config.port, () => {
    console.log(
      `logging-middleware running on http://127.0.0.1:${config.port}`,
    );
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`logging-middleware port ${config.port} is already in use`);
      process.exit(0);
    }

    throw error;
  });
}

module.exports = app;
