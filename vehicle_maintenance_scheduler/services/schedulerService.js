const axios = require("axios");
const { Log } = require("../../logging-middleware/utils/logger");

async function safeLog(stack, level, packageName, message) {
  await Log(stack, level, packageName, message);
}

async function fetchDepots(baseUrl) {
  try {
    await safeLog("backend", "info", "service", "Fetching depots");
    const response = await axios.get(`${baseUrl}/api/depots`, {
      timeout: 5000,
    });
    await safeLog("backend", "info", "service", "Fetched depots successfully");
    return response.data.depots || [];
  } catch (error) {
    await safeLog("backend", "error", "service", "Failed to fetch depots");
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch depots",
    );
  }
}

async function fetchVehicles(baseUrl) {
  try {
    await safeLog("backend", "info", "service", "Fetching vehicles");
    const response = await axios.get(`${baseUrl}/api/vehicles`, {
      timeout: 5000,
    });
    await safeLog(
      "backend",
      "info",
      "service",
      "Fetched vehicles successfully",
    );
    return response.data.vehicles || [];
  } catch (error) {
    await safeLog("backend", "error", "service", "Failed to fetch vehicles");
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch vehicles",
    );
  }
}

function solveKnapsack(vehicles, maxDuration) {
  const items = vehicles.map((vehicle) => ({
    id: vehicle.id,
    depotId: vehicle.depotId,
    duration: Number(vehicle.duration || 0),
    impact: Number(vehicle.impact || 0),
    name: vehicle.name,
  }));

  const capacity = Math.max(0, Number(maxDuration || 0));
  const itemCount = items.length;
  const dp = Array.from({ length: itemCount + 1 }, () =>
    new Array(capacity + 1).fill(0),
  );

  for (let index = 1; index <= itemCount; index += 1) {
    const item = items[index - 1];

    for (let duration = 0; duration <= capacity; duration += 1) {
      dp[index][duration] = dp[index - 1][duration];

      if (item.duration <= duration) {
        const candidate = dp[index - 1][duration - item.duration] + item.impact;

        if (candidate > dp[index][duration]) {
          dp[index][duration] = candidate;
        }
      }
    }
  }

  const selected = [];
  let remainingDuration = capacity;

  for (let index = itemCount; index > 0; index -= 1) {
    if (dp[index][remainingDuration] !== dp[index - 1][remainingDuration]) {
      const item = items[index - 1];
      selected.push(item);
      remainingDuration -= item.duration;
    }
  }

  selected.reverse();

  return {
    selectedVehicles: selected,
    totalDuration: selected.reduce((sum, item) => sum + item.duration, 0),
    totalImpact: selected.reduce((sum, item) => sum + item.impact, 0),
  };
}

async function buildSchedule({ baseUrl, maxDuration }) {
  const [depots, vehicles] = await Promise.all([
    fetchDepots(baseUrl),
    fetchVehicles(baseUrl),
  ]);

  const schedule = solveKnapsack(vehicles, maxDuration);
  const depotMap = depots.reduce((accumulator, depot) => {
    accumulator[depot.id] = depot;
    return accumulator;
  }, {});

  return {
    depots,
    vehicles,
    maxDuration: Number(maxDuration || 0),
    totalDuration: schedule.totalDuration,
    totalImpact: schedule.totalImpact,
    selectedVehicles: schedule.selectedVehicles.map((vehicle) => ({
      ...vehicle,
      depot: depotMap[vehicle.depotId] || null,
    })),
  };
}

module.exports = {
  fetchDepots,
  fetchVehicles,
  solveKnapsack,
  buildSchedule,
};
