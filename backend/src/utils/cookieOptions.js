const env = require("../config/env");

const getCookieOptions = () => ({
  // Production-ready cookie configuration
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

module.exports = { getCookieOptions };
