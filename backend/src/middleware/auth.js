const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../utils/jwt");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized. No token provided.");
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id).select("-passwordHash");

  if (!user) {
    throw new ApiError(401, "User not found or token invalid.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account is inactive.");
  }

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(500, "protect middleware must run before authorize."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to access this resource."));
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};