const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");

const env = require("../config/env");
const ApiError = require("../utils/ApiError");

const notFound = (req, _res, next) => {
  next(
    new ApiError(
      StatusCodes.NOT_FOUND,
      `Route ${req.method} ${req.originalUrl} was not found.`
    )
  );
};

const errorHandler = (error, _req, res, _next) => {
  if (env.nodeEnv === "development") {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = error.message || "Something went wrong.";
  let details = error.details || null;

  if (error instanceof mongoose.Error.CastError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "A provided identifier is invalid.";
  }

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Validation failed.";
    details = Object.values(error.errors || {}).map((err) => ({
      field: err.path,
      message: err.message,
    }));
  }

  if (error.code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    message = "A record with that value already exists.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: env.nodeEnv === "development" ? error.stack : undefined,
  });
};

module.exports = {
  errorHandler,
  notFound,
};
