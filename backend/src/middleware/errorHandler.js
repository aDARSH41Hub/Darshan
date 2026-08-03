const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  let error = err;

  if (!(error instanceof ApiError)) {
    error = new ApiError(500, "Internal Server Error", [], false);
  }

  // Mongoose validation error
  if (err?.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((field) => field.message);
    error = new ApiError(400, "Validation failed", messages);
  }

  // Mongoose duplicate key error
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(
      409,
      `${field} already exists`,
      [`Duplicate value for ${field}`]
    );
  }

  // Mongoose bad ObjectId
  if (err?.name === "CastError") {
    error = new ApiError(400, `Invalid ${err.path}`, [`Invalid ${err.path}`]);
  }

  // JWT errors
  if (err?.name === "TokenExpiredError") {
    error = new ApiError(401, "Token expired");
  }

  if (err?.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token");
  }

  const response = {
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || "Internal Server Error",
  };

  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return res.status(response.statusCode).json(response);
};

module.exports = errorHandler;