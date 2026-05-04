const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");

const ApiError = require("../utils/ApiError");

const validateObjectId = (paramName) => (req, _res, next) => {
  // Validate MongoDB ObjectId before DB query
  const value =
    req.params[paramName] ?? req.body[paramName] ?? req.query[paramName] ?? null;

  if (value && !mongoose.Types.ObjectId.isValid(value)) {
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid identifier for "${paramName}".`
      )
    );
  }

  return next();
};

module.exports = { validateObjectId };
