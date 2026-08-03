const jwt = require("jsonwebtoken");
const ApiError = require("./ApiError");

const requireEnv = (key) => {
  const value = process.env[key] ||
    (process.env.NODE_ENV === 'test'
      ? {
          JWT_ACCESS_SECRET: 'test-access-secret',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
        }[key]
      : undefined);

  if (!value) {
    throw new ApiError(500, `Missing required environment variable: ${key}`);
  }
  return value;
};

const generateAccessToken = (payload) => {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  return jwt.sign(payload, secret, { expiresIn });
};

const generateRefreshToken = (payload) => {
  const secret = requireEnv("JWT_REFRESH_SECRET");
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyAccessToken = (token) => {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  return jwt.verify(token, secret);
};

const verifyRefreshToken = (token) => {
  const secret = requireEnv("JWT_REFRESH_SECRET");
  return jwt.verify(token, secret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};