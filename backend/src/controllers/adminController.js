const User = require('../models/User');
const AdminActionLog = require('../models/AdminActionLog');
const VerificationRequest = require('../models/VerificationRequest');

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
 * @desc    Get pending verification requests
 * @route   GET /api/admin/verifications/pending
 * @access  Private/Admin
 */
exports.getPendingVerifications = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filter = { status: 'Pending' };
  
      const requests = await VerificationRequest.find(filter)
        .populate('user', 'name email role') // Populate basic user info
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: 1 }); // Oldest first
  
      const total = await VerificationRequest.countDocuments(filter);
  
      res.status(200).json({
        success: true,
        data: requests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error getting pending verifications:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * @desc    Approve a verification request
 * @route   PUT /api/admin/verifications/:requestId/approve
 * @access  Private/Admin
 */
exports.approveVerification = async (req, res) => {
    try {
        const { requestId } = req.params;
        const verificationRequest = await VerificationRequest.findById(requestId);

        if (!verificationRequest || verificationRequest.status !== 'Pending') {
            return res.status(404).json({ success: false, error: 'Pending verification request not found' });
        }

        const user = await User.findById(verificationRequest.user);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Associated user not found' });
        }

        // Update user status
        user.isVerified = true;
        user.verificationStatus = 'Approved';
        await user.save();

        // Update request status
        verificationRequest.status = 'Approved';
        verificationRequest.reviewedBy = req.user.id;
        verificationRequest.reviewedAt = Date.now();
        await verificationRequest.save();

        await logAdminAction(req.user.id, user._id, 'VerifyUser', 'Verification request approved');

        res.status(200).json({ success: true, message: 'Verification request approved successfully' });
    } catch (error) {
        console.error('Error approving verification:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * @desc    Reject a verification request
 * @route   PUT /api/admin/verifications/:requestId/reject
 * @access  Private/Admin
 */
exports.rejectVerification = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { reason } = req.body;
        const verificationRequest = await VerificationRequest.findById(requestId);

        if (!verificationRequest || verificationRequest.status !== 'Pending') {
            return res.status(404).json({ success: false, error: 'Pending verification request not found' });
        }

        const user = await User.findById(verificationRequest.user);
        if (!user) {
            // Should ideally not happen, but handle defensively
            verificationRequest.status = 'Rejected'; // Mark request as rejected even if user is gone
            verificationRequest.notes = `Rejection reason: ${reason || 'No reason specified'}. User not found.`;
            verificationRequest.reviewedBy = req.user.id;
            verificationRequest.reviewedAt = Date.now();
            await verificationRequest.save();
            return res.status(404).json({ success: false, error: 'Associated user not found, request marked rejected' });
        }

        // Update user status
        user.isVerified = false;
        user.verificationStatus = 'Rejected';
        await user.save();

        // Update request status
        verificationRequest.status = 'Rejected';
        verificationRequest.notes = `Rejection reason: ${reason || 'No reason specified'}`;
        verificationRequest.reviewedBy = req.user.id;
        verificationRequest.reviewedAt = Date.now();
        await verificationRequest.save();

        await logAdminAction(req.user.id, user._id, 'RejectVerification', reason || 'Verification request rejected');

        res.status(200).json({ success: true, message: 'Verification request rejected successfully' });
    } catch (error) {
        console.error('Error rejecting verification:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

/**
 * @desc    Get admin action logs (paginated)
 * @route   GET /api/admin/logs
 * @access  Private/Admin
 */
exports.getActionLogs = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filter = {}; // Add filters later (by admin, by target user, by action type)
  
      const logs = await AdminActionLog.find(filter)
        .populate('adminUser', 'name email')
        .populate('targetUser', 'name email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
  
      const total = await AdminActionLog.countDocuments(filter);
  
      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error getting admin action logs:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
}; 