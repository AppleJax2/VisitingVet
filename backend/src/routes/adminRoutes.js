const express = require('express');
const {
  getAllUsers,
  getUserDetails,
  adminCreateUser,
  adminCreateUpdateProfile,
  banUser,
  unbanUser,
  verifyUser,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getActionLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes below are protected and require Admin role
router.use(protect);
router.use(authorize('Admin')); // Use existing authorize middleware

// User Management Routes
router.post('/users/create', adminCreateUser);
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId/ban', banUser);
router.put('/users/:userId/unban', unbanUser);
router.put('/users/:userId/verify', verifyUser);

// Profile Management (Admin)
router.put('/users/:userId/profile', adminCreateUpdateProfile);

// Verification Routes
router.get('/verifications/pending', getPendingVerifications);
router.put('/verifications/:requestId/approve', approveVerification);
router.put('/verifications/:requestId/reject', rejectVerification);

// Logging Routes
router.get('/logs', getActionLogs);

module.exports = router; 