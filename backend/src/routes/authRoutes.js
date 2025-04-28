const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  refreshToken,
  setupMFA,
  verifyAndEnableMFA,
  disableMFA,
  verifyMFALogin
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser); // Protect logout route
router.get('/me', protect, getMe); // Protect getMe route
router.post('/refresh', refreshToken);

// MFA routes
router.post('/mfa/setup', protect, setupMFA);
router.post('/mfa/verify', protect, verifyAndEnableMFA);
router.post('/mfa/disable', protect, disableMFA);
router.post('/mfa/verify-login', verifyMFALogin);

module.exports = router; 