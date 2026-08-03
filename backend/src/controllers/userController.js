// backend/src/controllers/userController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');          // ← FIXED: was missing
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const profileService = require('../services/user/profileService');

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  const profile = await profileService.getProfileByUserId(req.user._id);

  return res.status(200).json(
    new ApiResponse(200, 'User fetched successfully', {
      user,
      profile: profile || null,
    })
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    'bio',
    'avatar',
    'phone',
    'location',
    'languages',
    'travelInterests',
    'preferences',
  ];

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const profile = await profileService.createOrUpdateProfile(req.user._id, updates);

  return res.status(200).json(
    new ApiResponse(200, 'Profile updated successfully', { profile })
  );
});

const getPublicProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // ← FIXED: validate ObjectId before querying
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  const user = await User.findById(userId).select('name role createdAt');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const profile = await profileService.getProfileByUserId(userId);

  return res.status(200).json(
    new ApiResponse(200, 'Public profile fetched', {
      user,
      profile: profile
        ? {
            bio: profile.bio,
            avatar: profile.avatar,
            location: profile.location,
            travelInterests: profile.travelInterests,
          }
        : null,
    })
  );
});

module.exports = {
  getMe,
  updateProfile,
  getPublicProfile,
};