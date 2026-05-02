const express = require("express");
const dotenv = require("dotenv");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();

const app = express();
const port = Number(process.env.NOTIFICATION_PORT || 3003);
const apiToken = process.env.NOTIFICATION_API_TOKEN || "notification-token";

app.use(express.json());

function authenticateBearer(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || token !== apiToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.authToken = token;
  return next();
}

app.get("/health", async (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/notifications", authenticateBearer, notificationRoutes);

app.use((error, req, res, next) => {
  res.status(500).json({ message: error.message || "Internal Server Error" });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`notification_app_be running on http://127.0.0.1:${port}`);
  });
}

module.exports = app;
