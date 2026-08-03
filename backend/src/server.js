// backend/src/server.js
require('dotenv').config();
const { validateEnv } = require('./config/env');
validateEnv(); // fail fast before DB connect

const { connectDB } = require('./config/db');
const { createApp } = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Darshan API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();