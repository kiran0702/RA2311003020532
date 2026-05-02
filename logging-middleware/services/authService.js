const axios = require("axios");
const config = require("../config/config");

let cachedRegistration = null;
let cachedAuth = null;

function buildRegistrationPayload() {
  return {
    email: config.email,
    name: config.name,
    mobileNo: config.mobileNo,
    githubUsername: config.githubUsername,
    rollNo: config.rollNo,
    accessCode: config.accessCode,
  };
}

function buildRegistrationPayloadFromInput(input) {
  return {
    ...buildRegistrationPayload(),
    email: String(input?.email || config.email || "").trim(),
    name: String(input?.name || config.name || "").trim(),
    mobileNo: String(input?.mobileNo || config.mobileNo || "").trim(),
    githubUsername: String(
      input?.githubUsername || config.githubUsername || "",
    ).trim(),
    rollNo: String(input?.rollNo || config.rollNo || "").trim(),
    accessCode: String(input?.accessCode || config.accessCode || "").trim(),
  };
}

function buildAuthPayload(registrationData, input) {
  return {
    ...buildRegistrationPayloadFromInput(input),
    clientID: registrationData.clientID,
    clientSecret: input?.clientSecret || registrationData.clientSecret,
  };
}

async function registerClient(input = {}) {
  if (cachedRegistration) {
    return cachedRegistration;
  }

  const response = await axios.post(
    `${config.evaluationBaseUrl}/register`,
    buildRegistrationPayloadFromInput(input),
    {
      timeout: 10000,
    },
  );

  cachedRegistration = response.data;
  return cachedRegistration;
}

async function authenticateClient(input = {}) {
  if (cachedAuth && cachedAuth.expiresAt && cachedAuth.expiresAt > Date.now()) {
    return cachedAuth;
  }

  const registration = await registerClient(input);

  const response = await axios.post(
    `${config.evaluationBaseUrl}/auth`,
    buildAuthPayload(registration, input),
    {
      timeout: 10000,
    },
  );

  const authData = response.data;
  cachedAuth = {
    ...authData,
    expiresAt: Date.now() + Number(authData.expires_in || 0) * 1000,
  };

  return cachedAuth;
}

async function verifyToken(token) {
  const auth = await authenticateClient();

  if (!auth || auth.access_token !== token) {
    return null;
  }

  return {
    clientID: cachedRegistration?.clientID || null,
    accessToken: token,
  };
}

module.exports = {
  registerClient,
  authenticateClient,
  verifyToken,
};
