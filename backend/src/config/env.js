// backend/src/config/env.js
const requiredVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGO_URI',
  'PORT',
];

const optionalVars = {
  NODE_ENV: 'development',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  CORS_ORIGIN: 'http://localhost:5173',
};

function validateEnv() {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`[FATAL] Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  // set sensible defaults so downstream code never has to check
  Object.entries(optionalVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  });

  console.log(`[ENV] Validated. Mode: ${process.env.NODE_ENV}`);
}

module.exports = { validateEnv };