const express = require('express');
const {
  createUpdateProfile,
  getMyProfile,
  getProfileById,
  listProfiles,
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes for visiting vet profiles
router.route('/visiting-vet')
  .post(protect, authorize('MVSProvider'), createUpdateProfile)  // Create/update profile
  .get(listProfiles);  // List all profiles (public)

router.get('/visiting-vet/me', protect, authorize('MVSProvider'), getMyProfile);  // Get own profile
router.get('/visiting-vet/:id', getProfileById);  // Get profile by ID (public)

module.exports = router; 