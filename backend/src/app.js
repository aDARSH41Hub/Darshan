/**
 * Darshan backend — Express app.
 *
 * This is the one fully functional file in the initial scaffold (health-check
 * endpoint), so CI has something real to run against from commit one, same
 * pattern used in the NoZoneAI scaffold.
 */

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "darshan-api" });
  });
  //M2
  app.use("/auth", authRoutes);
  // TODO (M2): mount routes/places, routes/itinerary
  // TODO (M9): mount routes/social (profiles, follow)
  // TODO (M10): mount routes/posts (blog + photo, zone tagging)
  // TODO (M12): mount Socket.IO proximity + chat handlers (see PDD NFR7-10
  //             for the non-negotiable safety requirements before this ships)

  return app;
}

module.exports = { createApp };
