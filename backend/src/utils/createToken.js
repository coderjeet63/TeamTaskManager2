const jwt = require("jsonwebtoken");

const env = require("../config/env");

const createToken = (userId) =>
  jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: "7d",
  });

module.exports = createToken;
