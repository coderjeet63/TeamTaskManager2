const { StatusCodes } = require("http-status-codes");

const env = require("../config/env");
const User = require("../models/User");
const { getCookieOptions } = require("../utils/cookieOptions");
const createToken = require("../utils/createToken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const serializeUser = require("../utils/serializeUser");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = createToken(user._id);
  res.cookie(env.cookieName, token, getCookieOptions());

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Account created successfully.",
    data: {
      user: serializeUser(user),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  const token = createToken(user._id);
  res.cookie(env.cookieName, token, getCookieOptions());

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Logged in successfully.",
    data: {
      user: serializeUser(user),
    },
  });
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(env.cookieName, getCookieOptions());

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Logged out successfully.",
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

module.exports = {
  getCurrentUser,
  login,
  logout,
  register,
};
