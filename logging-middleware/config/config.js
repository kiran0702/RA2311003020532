const dotenv = require("dotenv");

dotenv.config();

const port = Number(process.env.LOGGING_PORT || 3001);

module.exports = {
  port,
  evaluationBaseUrl:
    process.env.LOGGING_EVALUATION_BASE_URL ||
    "http://20.207.122.201/evaluation-service",
  accessCode: process.env.LOG_ACCESS_CODE || "QkbpxH",
  email: process.env.LOG_EMAIL || "",
  name: process.env.LOG_NAME || "",
  mobileNo: process.env.LOG_MOBILE_NO || "",
  githubUsername: process.env.LOG_GITHUB_USERNAME || "",
  rollNo: process.env.LOG_ROLL_NO || "",
};
