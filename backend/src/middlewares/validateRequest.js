const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

const ApiError = require("../utils/ApiError");

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "Validation failed.",
        errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        }))
      )
    );
  }

  return next();
};

module.exports = validateRequest;
