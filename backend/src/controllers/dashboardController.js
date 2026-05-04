const { StatusCodes } = require("http-status-codes");

const { getDashboardOverview } = require("../services/dashboardService");
const asyncHandler = require("../utils/asyncHandler");

const getOverview = asyncHandler(async (req, res) => {
  const overview = await getDashboardOverview(req.user);

  res.status(StatusCodes.OK).json({
    success: true,
    data: overview,
  });
});

module.exports = { getOverview };
