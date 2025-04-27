const express = require('express');
const { 
  updateMyDetails, 
  changeMyPassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes below are protected
router.use(protect);

// User profile and settings routes
router.put('/me', updateMyDetails);
router.put('/me/password', changeMyPassword);

module.exports = router; 