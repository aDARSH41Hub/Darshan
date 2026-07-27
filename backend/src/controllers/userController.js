const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, "User profile fetched successfully", {
      user: req.user,
    })
  );
});

module.exports = {
  getMe,
};