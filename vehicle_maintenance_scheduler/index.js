const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const { buildSchedule } = require("./services/schedulerService");

dotenv.config();

const app = express();
const port = Number(process.env.SCHEDULER_PORT || 3002);
const baseUrl = process.env.SCHEDULER_BASE_URL || `http://127.0.0.1:${port}`;

const depots = [
  { id: "depot-1", name: "North Depot", region: "North" },
  { id: "depot-2", name: "South Depot", region: "South" },
  { id: "depot-3", name: "Central Depot", region: "Central" },
];

const vehicles = [
  {
    id: "vehicle-1",
    depotId: "depot-1",
    name: "Truck 101",
    duration: 4,
    impact: 10,
  },
  {
    id: "vehicle-2",
    depotId: "depot-1",
    name: "Van 202",
    duration: 2,
    impact: 4,
  },
  {
    id: "vehicle-3",
    depotId: "depot-2",
    name: "Bus 303",
    duration: 6,
    impact: 12,
  },
  {
    id: "vehicle-4",
    depotId: "depot-3",
    name: "Car 404",
    duration: 3,
    impact: 7,
  },
  {
    id: "vehicle-5",
    depotId: "depot-2",
    name: "Truck 505",
    duration: 5,
    impact: 11,
  },
];

const useUpstream =
  String(process.env.SCHEDULER_USE_UPSTREAM || "false").toLowerCase() ===
  "true";
const evaluationBaseUrl =
  process.env.SCHEDULER_EVALUATION_BASE_URL ||
  "http://20.207.122.201/evaluation-service";
const loggingServiceBaseUrl =
  process.env.LOGGING_SERVICE_BASE_URL || "http://127.0.0.1:3001";

async function fetchEvaluationToken() {
  try {
    const payload = {
      email:
        process.env.LOG_EMAIL ||
        process.env.SCHEDULER_EMAIL ||
        "kp8533@srmist.edu.in",
      name: process.env.LOG_NAME || process.env.SCHEDULER_NAME || "Kiran P",
      mobileNo:
        process.env.LOG_MOBILE_NO ||
        process.env.SCHEDULER_MOBILE_NO ||
        "7338993901",
      githubUsername:
        process.env.LOG_GITHUB_USERNAME ||
        process.env.SCHEDULER_GITHUB_USERNAME ||
        "kiran0702",
      rollNo:
        process.env.LOG_ROLL_NO ||
        process.env.SCHEDULER_ROLL_NO ||
        "RA2311003020532",
      accessCode:
        process.env.LOG_ACCESS_CODE ||
        process.env.SCHEDULER_ACCESS_CODE ||
        "QkbpxH",
    };

    const resp = await axios.post(
      `${loggingServiceBaseUrl}/evaluation-service/auth`,
      payload,
      { timeout: 10000 },
    );
    return resp.data.access_token;
  } catch (err) {
    console.warn("Failed to fetch evaluation token:", err.message || err);
    return null;
  }
}

async function fetchFromEvaluation(path) {
  const token = await fetchEvaluationToken();
  if (!token) return null;

  const resp = await axios.get(
    `${evaluationBaseUrl}/${path.replace(/^\/+/, "")}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    },
  );

  return resp.data;
}

app.use(express.json());

// Normalize request URL: trim trailing spaces and %20 that may be appended
// by API clients accidentally (e.g. Postman with a trailing space in the URL).
app.use((req, res, next) => {
  try {
    const [path, qs] = req.url.split("?");
    const trimmed = path.replaceAll("%20", "").trim();
    req.url = qs ? `${trimmed}?${qs}` : trimmed;
  } catch (error) {
    console.warn("URL normalization skipped:", error.message || error);
  }
  return next();
});

app.use((req, res, next) => {
  try {
    const original = req.originalUrl || req.url || "";
    const decoded = decodeURIComponent(original);
    const cleaned = decoded.trim();

    if (cleaned !== decoded) {
      return res.redirect(301, cleaned);
    }
  } catch (error) {
    console.warn("Incoming URL cleanup skipped:", error.message || error);
  }

  return next();
});

app.get("/health", async (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/depots", async (req, res) => {
  if (useUpstream) {
    try {
      const data = await fetchFromEvaluation("depots");
      if (data?.depots) {
        return res.json({ depots: data.depots });
      }
    } catch (error) {
      console.warn("Upstream depots fetch failed:", error.message || error);
    }
  }

  res.json({ depots });
});

app.get("/api/vehicles", async (req, res) => {
  if (useUpstream) {
    try {
      const data = await fetchFromEvaluation("vehicles");
      if (data?.vehicles) {
        return res.json({ vehicles: data.vehicles });
      }
    } catch (error) {
      console.warn("Upstream vehicles fetch failed:", error.message || error);
    }
  }

  res.json({ vehicles });
});

app.post("/api/schedule", async (req, res, next) => {
  try {
    const maxDuration = Number(req.body.maxDuration || 10);
    const schedule = await buildSchedule({ baseUrl, maxDuration });
    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  res.status(500).json({ message: error.message || "Internal Server Error" });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(
      `vehicle_maintenance_scheduler running on http://127.0.0.1:${port}`,
    );
  });
}

module.exports = app;
