// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // skip rate limits during automated tests
  skip: () => process.env.NODE_ENV === 'test',
  max: 10, // 10 attempts per window per IP
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
};