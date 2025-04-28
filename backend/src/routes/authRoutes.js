const express = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  refreshToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser); // Protect logout route
router.get('/me', protect, getMe); // Protect getMe route
router.post('/refresh', refreshToken);

module.exports = router; 