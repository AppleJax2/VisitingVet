const User = require('../models/User');
const Role = require('../models/Role'); // Assuming Role model exists
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { logUserActivity } = require('./userActivityController'); // Import the logger
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');

// In-memory store for login attempts (Replace with Redis/DB for production)
const loginAttempts = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

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
    role: roleName, 
    name, 
    phoneNumber, 
    carrier, 
    smsNotificationsEnabled, 
    emailNotificationsEnabled 
  } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  try {
    // Basic validation
    if (!email || !password || !roleName) {
      await logUserActivity(null, ip, 'REGISTER_FAILURE', 'FAILURE', { email }, 'Missing email, password, or role');
      return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      await logUserActivity(null, ip, 'REGISTER_FAILURE', 'FAILURE', { email }, 'User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate carrier if phone number is provided
    if (phoneNumber && smsNotificationsEnabled && !carrier) {
      await logUserActivity(null, ip, 'REGISTER_FAILURE', 'FAILURE', { email }, 'Mobile carrier is required for SMS notifications');
      return res.status(400).json({ message: 'Mobile carrier is required for SMS notifications' });
    }

    // Normalize role name by removing spaces and converting to correct format
    let normalizedRoleName = roleName;
    
    // Handle the display names shown in the UI vs the actual role names in the database
    if (roleName === 'Pet Owner') {
      normalizedRoleName = 'PetOwner';
    } else if (roleName === 'Mobile Vet Provider') {
      normalizedRoleName = 'MVSProvider';
    } else if (roleName === 'Veterinary Clinic') {
      normalizedRoleName = 'Clinic';
    }

    // Find the default role or specific role based on normalized roleName
    const userRole = await Role.findOne({ name: normalizedRoleName });
    if (!userRole) {
        logger.error(`Registration failed: Role '${normalizedRoleName}' not found. Original role: '${roleName}'`);
        return res.status(400).json({ message: 'Invalid user role specified' });
    }

    // Create user with all provided fields
    const user = await User.create({
      email,
      password, // Password will be hashed by mongoose pre-save hook
      role: userRole._id, // Assign role ObjectId
      name: name || '',
      phoneNumber: phoneNumber || '',
      carrier: carrier || '',
      smsNotificationsEnabled: !!smsNotificationsEnabled,
      emailNotificationsEnabled: emailNotificationsEnabled !== false // Default to true
    });

    if (user) {
      await logUserActivity(user._id, ip, 'REGISTER_SUCCESS', 'SUCCESS', { email, role: userRole.name });
      sendTokenResponse(user, 201, res);
    } else {
      await logUserActivity(null, ip, 'REGISTER_FAILURE', 'FAILURE', { email }, 'Invalid user data');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    logger.error('Server Error during registration:', error);
    await logUserActivity(null, ip, 'REGISTER_FAILURE', 'FAILURE', { email }, error.message);
    res.status(500).json({ message: 'Server Error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password, mfaToken } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  let userId = null; // For logging failures before user is found

  try {
    // --- Suspicious Login Detection START ---
    const attemptsInfo = loginAttempts.get(ip);
    if (attemptsInfo) {
      const timeSinceLastAttempt = Date.now() - attemptsInfo.lastAttempt;
      if (attemptsInfo.attempts >= MAX_FAILED_ATTEMPTS && timeSinceLastAttempt < LOCKOUT_DURATION_MS) {
        const timeLeft = Math.ceil((LOCKOUT_DURATION_MS - timeSinceLastAttempt) / (60 * 1000));
        // Log the locked-out attempt
        await logUserActivity(null, ip, 'LOGIN_FAILURE', 'FAILURE', { email }, `IP Locked Out (${attemptsInfo.attempts} attempts)`);
        return res.status(429).json({ message: `Too many failed login attempts. Please try again in ${timeLeft} minutes.` });
      }
      if (timeSinceLastAttempt >= LOCKOUT_DURATION_MS) {
        loginAttempts.delete(ip);
      }
    }
    // --- Suspicious Login Detection END ---

    if (!email || !password) {
      // Log missing credentials failure
      await logUserActivity(null, ip, 'LOGIN_FAILURE', 'FAILURE', { email }, 'Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user, include password and populate role
    const user = await User.findOne({ email })
      .select('+password +refreshToken +role +sessionTimeoutMinutes +lastActivity +mfaEnabled +mfaSecret +mfaVerified') 
      .populate('role'); // Populate role object (which includes name and permissions)
      
    userId = user?._id; // Get userId if user found, used for logging

    // Check if user exists and has a valid role assigned
    if (!user || !user.role) {
      const currentAttempts = (loginAttempts.get(ip)?.attempts || 0) + 1;
      loginAttempts.set(ip, { attempts: currentAttempts, lastAttempt: Date.now() });
      // Log user not found/invalid role failure
      await logUserActivity(null, ip, 'LOGIN_FAILURE', 'FAILURE', { email }, 'Invalid credentials (User not found or role missing)');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      const currentAttempts = (loginAttempts.get(ip)?.attempts || 0) + 1;
      loginAttempts.set(ip, { attempts: currentAttempts, lastAttempt: Date.now() });
      // Log password mismatch failure
      await logUserActivity(userId, ip, 'LOGIN_FAILURE', 'FAILURE', { email }, 'Invalid credentials (Password mismatch)');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if MFA is enabled and needs verification
    if (user.mfaEnabled && user.mfaVerified) {
      // If MFA is enabled, check if MFA token is provided
      if (!mfaToken) {
        return res.status(200).json({
          success: false,
          mfaRequired: true,
          message: 'MFA verification required',
          userId: user._id
        });
      }

      // Verify the MFA token
      const isValidToken = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaToken,
        window: 1 // Allow 1 step before/after for clock skew
      });

      if (!isValidToken) {
        await logUserActivity(userId, ip, 'LOGIN_FAILURE', 'FAILURE', { email }, 'Invalid MFA token');
        return res.status(401).json({ message: 'Invalid MFA token' });
      }

      // If we're here, MFA verification was successful
      await logUserActivity(userId, ip, 'MFA_VERIFICATION_SUCCESS', 'SUCCESS', { email });
    }

    // --- Successful Login ---
    loginAttempts.delete(ip); // Reset failed attempts for this IP
    
    // Log successful login
    await logUserActivity(userId, ip, 'LOGIN_SUCCESS', 'SUCCESS', { email, role: user.role.name });

    // Update last activity and potentially session timeout based on role
    user.lastActivity = Date.now();
    user.sessionTimeoutMinutes = user.role.name === 'Admin' ? 15 : 30; // Example: timeout based on role name
    await user.save({ validateBeforeSave: false }); // Save changes

    await sendTokenResponse(user, 200, res);

  } catch (error) {
    logger.error(`Server Error during login for email ${email}, IP: ${ip}. Error: ${error.message}`, error);
    // Log generic server error during login
    await logUserActivity(userId, ip, 'LOGIN_FAILURE', 'FAILURE', { email }, `Server Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private (requires user to be logged in)
const logoutUser = async (req, res) => { // Made async for logging
  const ip = req.ip || req.connection.remoteAddress;
  const userId = req.user?._id; // Get user from protect middleware
  const userEmail = req.user?.email; // For logging context

  // Define cookie options based on environment
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

  try {
    // Clear the JWT and refreshToken cookies
    res.cookie('jwt', '', options);
    // Ensure path matches the one set during login for refreshToken
    res.cookie('refreshToken', '', { ...options, path: '/api/auth/refresh' }); 
    
    // Maybe redundant, but ensure they are cleared
    res.clearCookie('jwt', options);
    res.clearCookie('refreshToken', { ...options, path: '/api/auth/refresh' });

    if (userId) {
        // Log successful logout
        await logUserActivity(userId, ip, 'LOGOUT_SUCCESS', 'SUCCESS', { email: userEmail });
    }
    
    res.status(200).json({ success: true, message: 'Logged out successfully' });

  } catch (error) {
      logger.error(`Error during logout for user ${userId}:`, error);
      if (userId) {
          // Log logout failure if possible
          await logUserActivity(userId, ip, 'LOGOUT_FAILURE', 'FAILURE', { email: userEmail }, error.message);
      }
      // Still attempt to respond, but indicate potential issue
      res.status(500).json({ success: false, message: 'Logout failed. Please clear your browser cookies.' });
  }
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

// @desc    Generate MFA setup for a user
// @route   POST /api/auth/mfa/setup
// @access  Private (Admin only)
const setupMFA = async (req, res) => {
  try {
    // This should only be accessible by admin users
    if (req.user.role.name !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized. MFA is only available for admin accounts.' 
      });
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `VisitingVet:${req.user.email}`
    });

    // Save the secret to the user (but not enabled yet)
    await User.findByIdAndUpdate(req.user._id, {
      mfaSecret: secret.base32,
      mfaEnabled: false,
      mfaVerified: false
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex');
      backupCodes.push({ code: await bcrypt.hash(code, 10), used: false });
      // We'll show the unhashed codes to the user
    }

    // Update user with backup codes
    await User.findByIdAndUpdate(req.user._id, {
      mfaBackupCodes: backupCodes
    });

    // Return the data needed for setup
    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: backupCodes.map((_, index) => crypto.randomBytes(4).toString('hex')) // Generate new codes for display
    });
  } catch (error) {
    logger.error('MFA setup error:', error);
    res.status(500).json({ success: false, message: 'Failed to setup MFA' });
  }
};

// @desc    Verify and enable MFA for a user
// @route   POST /api/auth/mfa/verify
// @access  Private (Admin only)
const verifyAndEnableMFA = async (req, res) => {
  try {
    const { token } = req.body;

    // This should only be accessible by admin users
    if (req.user.role.name !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized. MFA is only available for admin accounts.' 
      });
    }

    // Get the user with MFA secret
    const user = await User.findById(req.user._id).select('+mfaSecret');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1 // Allow 1 step before/after for clock skew
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // Update user to enable MFA
    await User.findByIdAndUpdate(req.user._id, {
      mfaEnabled: true,
      mfaVerified: true
    });

    // Log the MFA enablement
    await logUserActivity(
      req.user._id, 
      req.ip || req.connection.remoteAddress, 
      'MFA_ENABLED', 
      'SUCCESS', 
      { email: req.user.email }
    );

    res.json({ success: true, message: 'MFA verified and enabled successfully' });
  } catch (error) {
    logger.error('MFA verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify MFA' });
  }
};

// @desc    Disable MFA for a user
// @route   POST /api/auth/mfa/disable
// @access  Private (Admin only)
const disableMFA = async (req, res) => {
  try {
    const { token } = req.body;

    // This should only be accessible by admin users
    if (req.user.role.name !== 'Admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized. MFA is only available for admin accounts.' 
      });
    }

    // Get the user with MFA secret
    const user = await User.findById(req.user._id).select('+mfaSecret');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify the token (needed to prove ownership before disabling)
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // Update user to disable MFA
    await User.findByIdAndUpdate(req.user._id, {
      mfaEnabled: false,
      mfaVerified: false,
      mfaSecret: null,
      mfaBackupCodes: []
    });

    // Log the MFA disablement
    await logUserActivity(
      req.user._id, 
      req.ip || req.connection.remoteAddress, 
      'MFA_DISABLED', 
      'SUCCESS', 
      { email: req.user.email }
    );

    res.json({ success: true, message: 'MFA disabled successfully' });
  } catch (error) {
    logger.error('MFA disable error:', error);
    res.status(500).json({ success: false, message: 'Failed to disable MFA' });
  }
};

// @desc    Verify MFA token during login
// @route   POST /api/auth/mfa/verify-login
// @access  Public
const verifyMFALogin = async (req, res) => {
  try {
    const { userId, mfaToken } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!userId || !mfaToken) {
      return res.status(400).json({ success: false, message: 'User ID and MFA token are required' });
    }

    // Get the user with MFA secret
    const user = await User.findById(userId)
      .select('+mfaSecret +mfaEnabled +mfaVerified +refreshToken')
      .populate('role');

    if (!user || !user.mfaEnabled || !user.mfaVerified) {
      await logUserActivity(null, ip, 'MFA_VERIFICATION_FAILURE', 'FAILURE', { userId }, 'User not found or MFA not enabled');
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: mfaToken,
      window: 1
    });

    if (!verified) {
      await logUserActivity(userId, ip, 'MFA_VERIFICATION_FAILURE', 'FAILURE', { userId }, 'Invalid MFA token');
      return res.status(401).json({ success: false, message: 'Invalid verification code' });
    }

    // If verification successful, log activity and send tokens
    await logUserActivity(userId, ip, 'MFA_VERIFICATION_SUCCESS', 'SUCCESS', { email: user.email });
    
    // Update last activity
    user.lastActivity = Date.now();
    await user.save({ validateBeforeSave: false });

    // Send login response with tokens
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('MFA login verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify MFA during login' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  refreshToken,
  setupMFA,
  verifyAndEnableMFA,
  disableMFA,
  verifyMFALogin
}; 