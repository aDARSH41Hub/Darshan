// backend/src/models/Profile.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          // allow empty string OR valid E.164
          return v === '' || /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: 'Invalid phone number format',
      },
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    languages: [{ type: String }],
    travelInterests: [{ type: String }],
    preferences: {
      currency: { type: String, default: 'INR' },
      notificationsEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);