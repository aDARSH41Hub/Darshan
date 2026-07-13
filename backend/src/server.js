require("dotenv").config();
const connectDB = require("./config/db");
const { createApp } = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Darshan API listening on port ${PORT}`);
  });
};

startServer();