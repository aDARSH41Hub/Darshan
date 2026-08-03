// backend/src/services/user/profileService.js
const Profile = require('../../models/Profile');

const getProfileByUserId = async (userId) => {
  return Profile.findOne({ userId }).lean();
};

const createOrUpdateProfile = async (userId, updateData) => {
  const profile = await Profile.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, upsert: true, runValidators: true }
  );
  return profile;
};

module.exports = {
  getProfileByUserId,
  createOrUpdateProfile,
};