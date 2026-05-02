const axios = require("axios");
const config = require("../config/config");
const { authenticateClient } = require("../services/authService");

async function getBearerToken() {
  const auth = await authenticateClient();
  return auth.access_token;
}

async function Log(stack, level, packageName, message) {
  try {
    const token = await getBearerToken();
    const response = await axios.post(
      `${config.evaluationBaseUrl}/logs`,
      {
        stack,
        level,
        package: packageName,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      },
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

module.exports = {
  Log,
};
