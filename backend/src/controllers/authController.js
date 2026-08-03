// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const tokenService = require('../services/auth/tokenService');

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';

const createTokenPair = (user) => {
  const payload = { id: user._id.toString(), role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  const { accessToken, refreshToken } = createTokenPair(user);

  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await tokenService.storeRefreshToken(user._id, refreshToken, refreshExpires);

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  return res.status(201).json(
    new ApiResponse(201, 'User registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      expiresIn: ACCESS_EXPIRES_IN,
    })
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  const { accessToken, refreshToken } = createTokenPair(user);

  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await tokenService.storeRefreshToken(user._id, refreshToken, refreshExpires);

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  return res.status(200).json(
    new ApiResponse(200, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      expiresIn: ACCESS_EXPIRES_IN,
    })
  );
});

const refresh = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies?.refreshToken;

  if (!tokenFromCookie) {
    throw new ApiError(401, 'Refresh token not provided');
  }

  const decoded = verifyRefreshToken(tokenFromCookie);

  const revoked = await tokenService.isTokenRevoked(tokenFromCookie);
  if (revoked) {
    console.warn(`[SECURITY] Reuse attempt of revoked token for user ${decoded.id}`);
    throw new ApiError(401, 'Token revoked. Please login again.');
  }

  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await tokenService.rotateRefreshToken(tokenFromCookie, user._id);

  res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

  return res.status(200).json(
    new ApiResponse(200, 'Token refreshed successfully', {
      accessToken,
      expiresIn: ACCESS_EXPIRES_IN,
      user,
    })
  );
});

const logout = asyncHandler(async (req, res) => {
  const tokenFromCookie = req.cookies?.refreshToken;

  if (tokenFromCookie) {
    try {
      await tokenService.revokeRefreshToken(tokenFromCookie);
    } catch (err) {
      console.error('Failed to revoke token on logout:', err.message);
    }
  }

  res.clearCookie('refreshToken', {
    ...refreshCookieOptions,
    maxAge: undefined,
  });

  return res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
});

module.exports = {
  signup,
  login,
  refresh,
  logout,
};