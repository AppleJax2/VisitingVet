const express = require('express');
const {
  getAllUsers,
  getFilteredUsers,
  getUserDetails,
  adminCreateUser,
  adminCreateUpdateProfile,
  banUser,
  unbanUser,
  verifyUser,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getActionLogs,
  requestAdminPasswordReset,
  resetAdminPassword,
  getUserActivityLogs,
  handleBulkUserAction,
  getVerificationMetrics
} = require('../controllers/adminController');
const { protect, checkPermission, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Public Admin Auth Routes ---
// Placed before the general protect middleware
router.post('/auth/request-password-reset', requestAdminPasswordReset);
router.put('/auth/reset-password/:resetToken', resetAdminPassword);


// --- Protected Admin Routes ---
// Apply general protection and role/permission checks for all subsequent routes
// Use authorize('Admin') for simplicity, or checkPermission for granularity
router.use(protect);
router.use(authorize('Admin')); // Or use checkPermission('some:permission') globally if preferred

// User Management Routes (Requires admin role)
router.post('/users/create', checkPermission('users:create'), adminCreateUser);
router.get('/users', checkPermission('users:read'), getFilteredUsers);
router.get('/users/:userId', checkPermission('users:read'), getUserDetails);
router.put('/users/:userId/ban', checkPermission('users:update'), banUser);       // Requires users:update permission
router.put('/users/:userId/unban', checkPermission('users:update'), unbanUser);   // Requires users:update permission
router.put('/users/:userId/verify', checkPermission('users:verify'), verifyUser); // Requires users:verify permission

// Profile Management (Admin) (Requires profile:manage permission)
router.put('/users/:userId/profile', checkPermission('profile:manage'), adminCreateUpdateProfile);

// Verification Routes (Requires verifications:manage permission)
router.get('/verifications/pending', checkPermission('verifications:read'), getPendingVerifications);
router.put('/verifications/:requestId/approve', checkPermission('verifications:manage'), approveVerification);
router.put('/verifications/:requestId/reject', checkPermission('verifications:manage'), rejectVerification);

// Add route for verification metrics
router.get('/verifications/metrics', checkPermission('verifications:read_metrics'), getVerificationMetrics); // Requires verifications:read_metrics

// Logging Routes (Requires logs:read permission)
router.get('/logs', checkPermission('logs:read'), getActionLogs);

// Add route for user activity logs
router.get('/users/:userId/activity', checkPermission('users:read_activity'), getUserActivityLogs); // Requires users:read_activity

// Add route for bulk actions
router.post('/users/bulk-action', checkPermission('users:bulk_manage'), handleBulkUserAction); // Requires users:bulk_manage

module.exports = router; 