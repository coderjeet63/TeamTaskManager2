const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const env = require("../config/env");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, _res, next) => {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  const token = req.cookies?.[env.cookieName] || bearerToken;

  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required.");
  }

  // Secure JWT verification middleware
  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User session is invalid.");
  }

  req.user = user;
  next();
});

module.exports = { authenticate };
