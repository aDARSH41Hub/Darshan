const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new ApiError(500, "Failed to connect to database");
  }
};

module.exports = { connectDB };