const { StatusCodes } = require("http-status-codes");

const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const serializeUser = require("../utils/serializeUser");

const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.query?.trim() || "";

  if (!query) {
    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        users: [],
      },
    });
  }

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ],
  })
    .select("-password")
    .sort({ name: 1 })
    .limit(8);

  return res.status(StatusCodes.OK).json({
    success: true,
    data: {
      users: users.map(serializeUser),
    },
  });
});

module.exports = { searchUsers };
