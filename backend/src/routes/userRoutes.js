// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMe,
  updateProfile,
  getPublicProfile,
} = require('../controllers/userController');

router.get('/me', protect, getMe);
router.patch('/me', protect, updateProfile);
router.get('/:userId', protect, getPublicProfile);

module.exports = router;