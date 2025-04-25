const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Utility function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Utility to send token via HTTP-Only cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // days to milliseconds
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Use None for cross-site in prod, Lax otherwise
  };

  // Remove password from output
  const userOutput = { ...user._doc };
  delete userOutput.password;

  res
    .status(statusCode)
    .cookie('jwt', token, options)
    .json({
      success: true,
      user: userOutput, // Send user data back (excluding password)
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { email, password, role } = req.body;

  try {
    // Basic validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password, // Password will be hashed by mongoose pre-save hook
      role,
    });

    if (user) {
      sendTokenResponse(user, 201, res);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Generic message
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Generic message
    }

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private (requires user to be logged in)
const logoutUser = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  // req.user is set by the protect middleware
  if (!req.user) {
    return res.status(401).json({ message: 'User not found or not logged in' });
  }
  res.status(200).json({ success: true, user: req.user });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
}; 