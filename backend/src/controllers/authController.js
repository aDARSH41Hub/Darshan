const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const createTokenPair = (user) => {
  const payload = {
    id: user._id.toString(),
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required", [
      "name is required",
      "email is required",
      "password is required",
    ]);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  const { accessToken, refreshToken } = createTokenPair(user);

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    })
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = createTokenPair(user);

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return res.status(200).json(
    new ApiResponse(200, "Login successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    })
  );
});

const refresh = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies?.refreshToken;

  if (!tokenFromCookie) {
    throw new ApiError(401, "Refresh token not provided");
  }

  const decoded = verifyRefreshToken(tokenFromCookie);

  const user = await User.findById(decoded.id).select("-passwordHash");

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account is inactive");
  }

  const { accessToken, refreshToken } = createTokenPair(user);

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return res.status(200).json(
    new ApiResponse(200, "Token refreshed successfully", {
      accessToken,
      user,
    })
  );
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", {
    ...refreshCookieOptions,
    maxAge: undefined,
  });

  return res.status(200).json(
    new ApiResponse(200, "Logged out successfully")
  );
});

module.exports = {
  signup,
  login,
  refresh,
  logout,
};