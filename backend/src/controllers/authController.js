const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Utility function to generate JWT
const generateToken = (id, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

// Utility to generate a secure refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Utility to send tokens via HTTP-Only cookies
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateToken(user._id, process.env.JWT_EXPIRES_IN || '15m');
  const refreshToken = generateRefreshToken();

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  // Hardened cookie options
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieDomain = isProduction ? process.env.COOKIE_DOMAIN || undefined : undefined;

  const accessOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict', // Max CSRF protection
    domain: cookieDomain,
  };
  const refreshOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    path: '/api/auth/refresh',
    domain: cookieDomain,
  };

  // Remove password from output
  const userOutput = { ...user._doc };
  delete userOutput.password;
  delete userOutput.refreshToken;

  res
    .status(statusCode)
    .cookie('jwt', accessToken, accessOptions)
    .cookie('refreshToken', refreshToken, refreshOptions)
    .json({
      success: true,
      user: userOutput,
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { 
    email, 
    password, 
    role, 
    name, 
    phoneNumber, 
    carrier, 
    smsNotificationsEnabled, 
    emailNotificationsEnabled 
  } = req.body;

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

    // Validate carrier if phone number is provided
    if (phoneNumber && smsNotificationsEnabled && !carrier) {
      return res.status(400).json({ message: 'Mobile carrier is required for SMS notifications' });
    }

    // Create user with all provided fields
    const user = await User.create({
      email,
      password, // Password will be hashed by mongoose pre-save hook
      role,
      name: name || '',
      phoneNumber: phoneNumber || '',
      carrier: carrier || '',
      smsNotificationsEnabled: !!smsNotificationsEnabled,
      emailNotificationsEnabled: emailNotificationsEnabled !== false // Default to true
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
    const user = await User.findOne({ email }).select('+password +refreshToken');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set admin session properties if the user is an admin
    if (user.role === 'Admin') {
      user.isAdmin = true;
      user.sessionTimeoutMinutes = 15; // Stricter timeout for admin users (15 minutes)
      await user.save();
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private (requires user to be logged in)
const logoutUser = (req, res) => {
  // Hardened cookie options for clearing
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieDomain = isProduction ? process.env.COOKIE_DOMAIN || undefined : undefined;
  const options = {
    expires: new Date(0), // Set expiry date to the past
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    path: '/',
    domain: cookieDomain,
  };

  // Clear the JWT and refreshToken cookies
  res.cookie('jwt', '', options);
  res.cookie('refreshToken', '', { ...options, path: '/api/auth/refresh' });
  res.clearCookie('jwt', options);
  res.clearCookie('refreshToken', { ...options, path: '/api/auth/refresh' });

  // Return success response
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

// @desc    Rotate JWT using refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }
  try {
    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    // Issue new access token and refresh token
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not rotate token' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  refreshToken,
}; 