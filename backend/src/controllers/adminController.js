const User = require('../models/User');
const Role = require('../models/Role'); // Needed to find admin role
const AdminActionLog = require('../models/AdminActionLog');
const VerificationRequest = require('../models/VerificationRequest');
const VisitingVetProfile = require('../models/VisitingVetProfile');
const crypto = require('crypto');
const { sendEmailNotification } = require('../utils/notificationService'); // Assuming an email utility
const logger = require('../utils/logger'); // Assuming logger
const UserActivityLog = require('../models/UserActivityLog'); // Import the model
const mongoose = require('mongoose');
const { getSecureDownloadUrl } = require('../services/documentService'); // Import S3 service
const { logDocumentAccess } = require('./documentController'); // Import logging function
const slaTrackingService = require('../services/slaTrackingService'); // Import SLA Service
const webSocketService = require('../services/websocketService'); // Import WebSocket service

// Helper function to log admin actions
const logAdminAction = async (adminUserId, targetUserId, actionType, reason = '', details = {}) => {
  try {
    await AdminActionLog.create({
      adminUser: adminUserId,
      targetUser: targetUserId,
      actionType,
      reason,
      details,
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Decide if failure to log should block the action or just be logged
  }
};

// Helper function to emit verification count update
const emitVerificationCountUpdate = async () => {
    try {
        const pendingCount = await VerificationRequest.countDocuments({ status: 'Pending' });
        webSocketService.emitAnalyticsUpdate('verificationCount', { pending: pendingCount });
    } catch (error) {
        logger.error('Error fetching or emitting pending verification count:', error);
    }
};

/**
 * @desc    Get all users (paginated, filterable)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const filter = {}; // Add filters for role, verificationStatus, isBanned later

    const users = await User.find(filter)
      .select('-password') // Exclude password
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Get single user details
 * @route   GET /api/admin/users/:userId
 * @access  Private/Admin
 */
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    // Optionally populate related data like verification requests or action logs
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Ban a user
 * @route   PUT /api/admin/users/:userId/ban
 * @access  Private/Admin
 */
exports.banUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'Admin') {
        return res.status(403).json({ success: false, error: 'Cannot ban an admin user' });
    }

    user.isBanned = true;
    user.banReason = reason || 'No reason provided';
    await user.save();

    await logAdminAction(req.user.id, user._id, 'BanUser', reason);

    res.status(200).json({ success: true, message: `User ${user.email} banned successfully` });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Unban a user
 * @route   PUT /api/admin/users/:userId/unban
 * @access  Private/Admin
 */
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.isBanned = false;
    user.banReason = '';
    await user.save();

    await logAdminAction(req.user.id, user._id, 'UnbanUser');

    res.status(200).json({ success: true, message: `User ${user.email} unbanned successfully` });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Manually verify a user
 * @route   PUT /api/admin/users/:userId/verify
 * @access  Private/Admin
 */
exports.verifyUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
  
      user.isVerified = true;
      user.verificationStatus = 'Approved'; // Manually approved
      await user.save();
  
      // Optionally update related VerificationRequest status if one exists
      await VerificationRequest.findOneAndUpdate(
        { user: user._id, status: 'Pending' }, 
        { status: 'Approved', reviewedBy: req.user.id, reviewedAt: Date.now() }
      );
  
      await logAdminAction(req.user.id, user._id, 'VerifyUser', 'Manual verification by admin');
  
      res.status(200).json({ success: true, message: `User ${user.email} verified successfully` });
    } catch (error) {
      console.error('Error verifying user:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * @desc    Get pending verification requests (Updated for Sorting)
 * @route   GET /api/admin/verifications/pending
 * @access  Private/Admin
 */
exports.getPendingVerifications = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const { sortBy } = req.query; // e.g., 'createdAt_asc', 'createdAt_desc'
      const filter = { status: 'Pending' };
      const adminUserId = req.user.id;
      const adminIp = req.ip || req.connection.remoteAddress;

      // Determine sort order
      let sort = { createdAt: 1 }; // Default: oldest first
      if (sortBy === 'createdAt_desc') {
          sort = { createdAt: -1 }; // Newest first
      }
      // Add other sort options later (e.g., priority)
      // if (sortBy === 'priority_desc') {
      //     sort = { priority: -1, createdAt: 1 }; // Sort by priority then oldest
      // }
      
      logger.debug("Verification Query Sort:", sort);
  
      const requests = await VerificationRequest.find(filter)
        .populate('user', 'name email role') 
        .sort(sort) // Apply dynamic sort
        .skip(skip)
        .limit(limit);
        
      const total = await VerificationRequest.countDocuments(filter);

      // Enhance requests with signed URLs (existing logic)
      const enhancedRequests = await Promise.all(requests.map(async (request) => {
          const requestObject = request.toObject();
          if (requestObject.documents && Array.isArray(requestObject.documents)) {
              requestObject.documents = await Promise.all(requestObject.documents.map(async (doc) => {
                  if (doc.fileKey) {
                      try {
                          const signedUrl = await getSecureDownloadUrl(doc.fileKey);
                          await logDocumentAccess(adminUserId, requestObject.user?._id, doc.fileKey, adminIp, doc.documentType);
                          return { ...doc, signedUrl };
                      } catch (urlError) {
                          logger.error(`Failed to get signed URL for key ${doc.fileKey} in request ${requestObject._id}:`, urlError);
                          return { ...doc, signedUrl: null, error: 'Could not generate URL' };
                      }
                  } else {
                     return doc;
                  }
              }));
          }
          return requestObject;
      }));
  
      res.status(200).json({
        success: true,
        data: enhancedRequests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Error getting pending verifications:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * @desc    Approve a verification request
 * @route   PUT /api/admin/verifications/:requestId/approve
 * @access  Private/Admin (Requires verifications:manage permission)
 */
exports.approveVerification = async (req, res) => {
    const { requestId } = req.params;
    const adminUserId = req.user.id; // From auth middleware

    try {
        const request = await VerificationRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Verification request not found' });
        }
        if (request.status !== 'Pending') {
            return res.status(400).json({ success: false, error: 'Request is not pending' });
        }

        // Update Verification Request
        request.status = 'Approved';
        request.reviewedBy = adminUserId;
        request.reviewedAt = new Date();
        await request.save();

        // Update associated User
        await User.findByIdAndUpdate(request.user, {
             isVerified: true, 
             verificationStatus: 'Approved' 
             // Optionally set user role if verification grants a specific role
        });

        logger.info(`Verification request ${requestId} approved by admin ${adminUserId}`);
        res.status(200).json({ success: true, data: request });
        
        // Emit update AFTER successful response
        await emitVerificationCountUpdate(); 

    } catch (error) {
        logger.error('Error approving verification request:', error);
        res.status(500).json({ success: false, error: 'Server error approving request' });
    }
};

/**
 * @desc    Reject a verification request
 * @route   PUT /api/admin/verifications/:requestId/reject
 * @access  Private/Admin (Requires verifications:manage permission)
 */
exports.rejectVerification = async (req, res) => {
     const { requestId } = req.params;
     const { reason } = req.body;
     const adminUserId = req.user.id;

     if (!reason) {
          return res.status(400).json({ success: false, error: 'Rejection reason is required' });
     }

    try {
        const request = await VerificationRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Verification request not found' });
        }
         if (request.status !== 'Pending') {
            return res.status(400).json({ success: false, error: 'Request is not pending' });
        }

        // Update Verification Request
        request.status = 'Rejected';
        request.notes = reason; // Store rejection reason in notes
        request.reviewedBy = adminUserId;
        request.reviewedAt = new Date();
        await request.save();

        // Update associated User (set verification status, isVerified remains false)
        await User.findByIdAndUpdate(request.user, {
            verificationStatus: 'Rejected' 
        });

        logger.info(`Verification request ${requestId} rejected by admin ${adminUserId}. Reason: ${reason}`);
        res.status(200).json({ success: true, data: request });
        
        // Emit update AFTER successful response
        await emitVerificationCountUpdate();

    } catch (error) {
        logger.error('Error rejecting verification request:', error);
        res.status(500).json({ success: false, error: 'Server error rejecting request' });
    }
};

/**
 * @desc    Get action logs with filtering and pagination
 * @route   GET /api/v1/admin/logs
 * @access  Private (Admin with logs:read permission)
 */
exports.getActionLogs = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    // Adjust default limit, maybe higher for dedicated log page
    const limit = parseInt(req.query.limit, 10) || (req.query.recent ? 5 : 50); // Smaller limit if ?recent=true
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.level) filter.level = req.query.level; // Filter by level (e.g., 'INFO', 'WARN', 'ERROR')
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.action) filter.action = { $regex: req.query.action, $options: 'i' }; // Case-insensitive search for action
    if (req.query.startDate || req.query.endDate) {
        filter.timestamp = {};
        if (req.query.startDate) filter.timestamp.$gte = new Date(req.query.startDate);
        if (req.query.endDate) {
            const endDate = new Date(req.query.endDate);
            endDate.setHours(23, 59, 59, 999);
            filter.timestamp.$lte = endDate;
        }
    }

    const total = await AdminActionLog.countDocuments(filter);
    const logs = await AdminActionLog.find(filter)
        .populate('adminUser', 'name email') // Populate user info if userId is present
        .populate('targetUser', 'name email')
        .sort({ timestamp: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        count: logs.length,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        },
        data: logs
    });
};

/**
 * @desc    Create a new user by Admin
 * @route   POST /api/admin/users/create
 * @access  Private/Admin
 */
exports.adminCreateUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, error: 'Please provide name, email, password, and role' });
  }

  // Check if role is valid (adjust based on your User model enum if applicable)
  const validRoles = ['PetOwner', 'MVSProvider', 'Clinic'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, error: `Invalid user role provided. Valid roles: ${validRoles.join(', ')}` });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password, // Password hashing is handled by the pre-save hook in User model
      role,
      isVerified: true,
      verificationStatus: 'Approved',
    });

    // Log admin action
    await logAdminAction(req.user.id, user._id, 'CreateUserByAdmin', `Created user with role: ${role}`, { email, role });

    // Exclude password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse,
    });

  } catch (error) {
    console.error('Error creating user by admin:', error);
    // Handle potential validation errors from Mongoose model
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, error: messages.join('. ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already exists.' });
    }
    res.status(500).json({ success: false, error: 'Server error during user creation' });
  }
};

/**
 * @desc    Create/Update a VisitingVetProfile for a specific user by Admin
 * @route   PUT /api/admin/users/:userId/profile
 * @access  Private/Admin
 */
exports.adminCreateUpdateProfile = async (req, res) => {
  const { userId } = req.params;
  const profileData = req.body;

  try {
    // Validate that the target user exists and is a provider
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Target user not found' });
    }
    if (!['MVSProvider', 'Clinic'].includes(targetUser.role)) {
        return res.status(400).json({ success: false, error: 'Target user must be a Mobile Provider or Clinic to have a profile managed this way.' });
    }

    // Ensure the 'user' field in the profile data is not attempted to be changed
    delete profileData.user; 
    delete profileData.password;
    delete profileData.email;
    delete profileData.role;

    // Find existing profile or prepare for creation
    let profile = await VisitingVetProfile.findOne({ user: userId });
    let logActionType = 'UpdateProfileByAdmin';
    let logMessage = 'Admin updated profile';
    let statusCode = 200; // OK for update

    if (profile) {
      // Update existing profile
      profile = await VisitingVetProfile.findOneAndUpdate({ user: userId }, { $set: profileData }, {
        new: true,
        runValidators: true,
        context: 'query' // Important for some validators
      });
      logActionType = 'UpdateProfileByAdmin';
      logMessage = 'Admin updated provider profile';
    } else {
      // Create new profile - ensure user field is set
      profileData.user = userId;
      profile = await VisitingVetProfile.create(profileData);
      logActionType = 'CreateProfileByAdmin';
      logMessage = 'Admin created provider profile';
      statusCode = 201; // Created
    }

    // Log the action
    await logAdminAction(req.user.id, userId, logActionType, logMessage);

    res.status(statusCode).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error creating/updating profile by admin:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join('. ') });
    }
    res.status(500).json({ success: false, error: 'Server error during profile update' });
  }
};

/**
 * @desc    Request password reset for an admin user
 * @route   POST /api/admin/auth/request-password-reset
 * @access  Public (or Admin-only if reset can only be triggered by another admin)
 */
exports.requestAdminPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Please provide an email address' });
  }

  try {
    // Find the user by email and populate their role
    const user = await User.findOne({ email }).populate('role');

    // IMPORTANT: Check if the user has an Admin role
    // This assumes 'Admin' is the name of the admin Role document
    if (!user || !user.role || user.role.name !== 'Admin') {
      // Do not reveal if the user exists or is an admin
      logger.warn(`Password reset requested for non-admin or non-existent email: ${email}`);
      return res.status(200).json({ success: true, message: 'If an admin account with this email exists, a password reset link has been sent.' });
    }

    // Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token and expiry on user document
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

    await user.save({ validateBeforeSave: false }); // Save without running other validations

    // Create reset URL (adjust CLIENT_URL and path as needed)
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) requested a password reset for your admin account.</p>
      <p>Please click on the following link, or paste it into your browser to complete the process:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
      await sendEmailNotification({
        to: user.email,
        subject: 'Admin Password Reset Request',
        html: message,
        // text: // Optional plain text version
      });

      logger.info(`Password reset email sent to admin: ${user.email}`);
      res.status(200).json({ success: true, message: 'Password reset link sent to email.' });

    } catch (emailError) {
      logger.error(`Failed to send password reset email to ${user.email}:`, emailError);
      // Clear the token if email failed? Or allow retry?
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, error: 'Error sending password reset email. Please try again later.' });
    }

  } catch (error) {
    logger.error('Error in requestAdminPasswordReset:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Reset admin password using token
 * @route   PUT /api/admin/auth/reset-password/:resetToken
 * @access  Public (requires valid token)
 */
exports.resetAdminPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, error: 'Please provide a new password' });
  }

  // Hash the token coming from the URL parameter to match the stored one
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  try {
    // Find user by hashed token and check expiry
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check if token is still valid
    }).populate('role'); // Populate role to confirm it's an admin

    if (!user) {
      logger.warn(`Invalid or expired password reset token attempt: ${resetToken.substring(0, 6)}...`);
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset token.' });
    }

    // Double-check it's an admin user for safety
    if (!user.role || user.role.name !== 'Admin') {
        logger.error(`Attempt to reset password for non-admin user via admin reset flow. User ID: ${user._id}`);
        return res.status(403).json({ success: false, error: 'This password reset link is not valid for this user type.' });
    }

    // Set the new password (pre-save hook will hash it)
    user.password = password;
    // Clear the reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save(); // This will trigger the pre-save hook to hash the new password

    logger.info(`Admin password successfully reset for email: ${user.email}`);

    // Optionally: Send a confirmation email
    // await sendEmailNotification({ to: user.email, subject: 'Password Changed', text: 'Your admin password has been successfully changed.' });

    // Optionally: Log the user out of other sessions?

    res.status(200).json({ success: true, message: 'Password reset successful.' });

  } catch (error) {
    logger.error('Error in resetAdminPassword:', error);
     if (error.name === 'ValidationError') { // Catch Mongoose validation errors (e.g., password length)
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, error: messages.join('. ') });
    }
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Get activity logs for a specific user (paginated)
 * @route   GET /api/admin/users/:userId/activity
 * @access  Private/Admin (Requires permission like 'users:read_activity')
 */
exports.getUserActivityLogs = async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25; // Number of logs per page
  const skip = (page - 1) * limit;

  try {
    // Check if target user exists (optional, but good practice)
    const userExists = await User.findById(userId).select('_id');
    if (!userExists) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Find logs for the user
    const logs = await UserActivityLog.find({ user: userId })
      .sort({ timestamp: -1 }) // Show most recent first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalLogs = await UserActivityLog.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total: totalLogs,
        pages: Math.ceil(totalLogs / limit),
      },
    });

  } catch (error) {
    logger.error(`Error fetching activity logs for user ${userId}:`, error);
    res.status(500).json({ success: false, error: 'Server error fetching activity logs' });
  }
};

/**
 * @desc    Get filtered/searched users (NEW implementation)
 * @route   GET /api/admin/users (Intended replacement for original getAllUsers)
 * @access  Private/Admin (Requires users:read permission)
 */
exports.getFilteredUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    // Build Filter Object
    const filter = {};
    const { roleId, verificationStatus, isBanned, startDate, endDate, search } = req.query;

    if (roleId && mongoose.Types.ObjectId.isValid(roleId)) {
        filter.role = roleId;
    }
    
    if (verificationStatus) {
      const validStatuses = User.schema.path('verificationStatus').enumValues;
      if (validStatuses.includes(verificationStatus)) {
          filter.verificationStatus = verificationStatus;
      } else {
          logger.warn(`Invalid verificationStatus received in user filter: ${verificationStatus}`);
      }
    }
    
    if (isBanned !== undefined && isBanned !== null && isBanned !== '') {
      filter.isBanned = String(isBanned).toLowerCase() === 'true';
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      try {
          if (startDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              if (!isNaN(start.getTime())) { 
                  filter.createdAt.$gte = start;
              }
          }
          if (endDate) {
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              if (!isNaN(end.getTime())) {
                  filter.createdAt.$lte = end;
              }
          }
          // Remove createdAt filter if it ended up empty (e.g., invalid dates)
          if (Object.keys(filter.createdAt).length === 0) {
              delete filter.createdAt;
          }
      } catch (dateError) {
          logger.warn("Error parsing date filters:", dateError);
          delete filter.createdAt; 
      }
    }
    
    if (search) {
      const searchTrimmed = search.trim();
      if (searchTrimmed.length > 0) {
          const searchRegex = new RegExp(searchTrimmed.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'); 
          filter.$or = [
            { name: searchRegex },
            { email: searchRegex },
          ];
      }
    }
    
    logger.debug("User Query Filter:", filter);

    const users = await User.find(filter)
      .populate('role', 'name') 
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires') 
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error getting filtered users:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving users' });
  }
};

/**
 * @desc    Perform bulk actions on users (ban, unban, verify)
 * @route   POST /api/admin/users/bulk-action
 * @access  Private/Admin (Requires permission like 'users:bulk_manage')
 */
exports.handleBulkUserAction = async (req, res) => {
  const { action, userIds, reason } = req.body;
  const adminUserId = req.user.id; // Admin performing the action

  // Validate input
  if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ success: false, error: 'Missing action or userIds array.' });
  }

  const validActions = ['ban', 'unban', 'verify'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ success: false, error: 'Invalid action specified.' });
  }

  if (action === 'ban' && !reason) {
      return res.status(400).json({ success: false, error: 'Reason is required for banning users.' });
  }

  // Sanitize userIds to be valid ObjectIds
  const validUserIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
  if (validUserIds.length !== userIds.length) {
      logger.warn('Bulk action request contained invalid user IDs.');
      // Decide whether to proceed with valid IDs or fail
  }
  if (validUserIds.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid user IDs provided.' });
  }

  let successCount = 0;
  let failureCount = 0;
  const errors = [];

  // Fetch target users and their roles to prevent targeting admins
  const targetUsers = await User.find({ 
      '_id': { $in: validUserIds }
  }).populate('role', 'name');
  
  const targetUserMap = new Map(targetUsers.map(user => [user._id.toString(), user]));

  for (const userId of validUserIds) {
    try {
      const user = targetUserMap.get(userId);

      if (!user) {
          throw new Error('User not found');
      }

      // Critical Check: Prevent targeting Admins
      if (user.role?.name === 'Admin') {
          throw new Error('Cannot target admin users with bulk actions.');
      }

      let logMessage = '';
      let logActionType = '';

      switch (action) {
        case 'ban':
          if (!user.isBanned) {
            user.isBanned = true;
            user.banReason = reason;
            await user.save();
            logActionType = 'BulkBanUser';
            logMessage = `Bulk ban reason: ${reason}`;
            successCount++;
          } else {
              // Optional: count already banned as success or skip?
              // successCount++;
          }
          break;
        case 'unban':
          if (user.isBanned) {
            user.isBanned = false;
            user.banReason = '';
            await user.save();
            logActionType = 'BulkUnbanUser';
            successCount++;
          } else {
              // Optional: count already unbanned as success or skip?
              // successCount++;
          }
          break;
        case 'verify':
          if (!user.isVerified) {
            user.isVerified = true;
            user.verificationStatus = 'Approved'; // Or a specific 'BulkApproved' status?
            await user.save();
            logActionType = 'BulkVerifyUser';
            successCount++;
          } else {
              // Optional: count already verified as success or skip?
              // successCount++;
          }
          break;
      }

      // Log individual action if successful and type is set
      if (logActionType) {
          await logAdminAction(adminUserId, userId, logActionType, logMessage || `Bulk action: ${action}`);
      }

    } catch (err) {
      failureCount++;
      const errorMsg = `Failed action '${action}' for user ${userId}: ${err.message}`;
      errors.push(errorMsg);
      logger.error(errorMsg, err);
    }
  }

  // Log the overall bulk action
  await logAdminAction(
      adminUserId, 
      null, // Target is multiple users
      `BulkAction_${action.toUpperCase()}`,
      `Performed on ${validUserIds.length} users. Success: ${successCount}, Failures: ${failureCount}. Reason (if applicable): ${reason || 'N/A'}`,
      { userIds: validUserIds, successCount, failureCount, errors: errors.slice(0, 10) } // Store first 10 errors for reference
  );

  res.status(200).json({
    success: true,
    message: `Bulk action '${action}' completed. Success: ${successCount}, Failures: ${failureCount}.`,
    results: {
      successCount,
      failureCount,
      errors,
    },
  });
};

/**
 * @desc    Get verification request history (paginated, filterable)
 * @route   GET /api/admin/verifications/history
 * @access  Private/Admin
 */
exports.getVerificationHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    const { status, userId, reviewerId, startDate, endDate, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.user = userId;
    }
    if (reviewerId && mongoose.Types.ObjectId.isValid(reviewerId)) {
      filter.reviewedBy = reviewerId;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (!isNaN(start.getTime())) filter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (!isNaN(end.getTime())) filter.createdAt.$lte = end;
      }
      if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
    }
    if (search) {
      const searchTrimmed = search.trim();
      if (searchTrimmed.length > 0) {
        const searchRegex = new RegExp(searchTrimmed.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
        filter.$or = [
          { notes: searchRegex },
        ];
      }
    }

    // Fetch requests with population
    const requests = await VerificationRequest.find(filter)
      .populate({ path: 'user', select: 'name email role' })
      .populate({ path: 'reviewedBy', select: 'name email role' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Enhance with secure document URLs
    const enhancedRequests = await Promise.all(requests.map(async (request) => {
      const reqObj = request.toObject();
      if (reqObj.submittedDocuments && Array.isArray(reqObj.submittedDocuments)) {
        reqObj.submittedDocuments = await Promise.all(reqObj.submittedDocuments.map(async (doc) => {
          if (doc.fileUrl && doc.fileUrl.startsWith('s3://')) {
            try {
              const fileKey = doc.fileUrl.replace('s3://', '');
              doc.signedUrl = await getSecureDownloadUrl(fileKey);
            } catch (err) {
              doc.signedUrl = null;
            }
          }
          return doc;
        }));
      }
      return reqObj;
    }));

    const total = await VerificationRequest.countDocuments(filter);
    res.status(200).json({
      success: true,
      data: enhancedRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error getting verification history:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Get basic metrics about verification requests
 * @route   GET /api/admin/verifications/metrics
 * @access  Private/Admin (Requires verifications:read_metrics permission)
 */
exports.getVerificationMetrics = async (req, res) => {
  try {
    const pendingCount = await VerificationRequest.countDocuments({ status: 'Pending' });
    const approvedCount = await VerificationRequest.countDocuments({ status: 'Approved' });
    const rejectedCount = await VerificationRequest.countDocuments({ status: 'Rejected' });
    const totalCount = pendingCount + approvedCount + rejectedCount; // Or count all

    // You could add more complex metrics later, e.g., average approval time
    // const avgProcessingTime = await VerificationRequest.aggregate([...]);

    res.status(200).json({
      success: true,
      data: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalCount,
        // avgProcessingTime: avgProcessingTime[0]?.avgDuration || null,
      },
    });
  } catch (error) {
    logger.error('Error fetching verification metrics:', error);
    res.status(500).json({ success: false, error: 'Server error fetching metrics' });
  }
};

// module.exports = {
//   getAllUsers,
//   getFilteredUsers,
//   getUserDetails,
//   adminCreateUser,
//   adminCreateUpdateProfile,
//   banUser,
//   unbanUser,
//   verifyUser,
//   getPendingVerifications,
//   approveVerification,
//   rejectVerification,
//   getActionLogs,
//   requestAdminPasswordReset,
//   resetAdminPassword,
//   getUserActivityLogs,
//   handleBulkUserAction,
//   getVerificationHistory,
//   getVerificationMetrics,
// }; 