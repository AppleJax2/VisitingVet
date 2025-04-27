const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @desc    Update logged-in user details
 * @route   PUT /api/users/me
 * @access  Private
 */
exports.updateMyDetails = async (req, res) => {
  try {
    // Get updatable fields from request body
    const {
      name,
      phoneNumber,
      carrier,
      smsNotificationsEnabled,
      emailNotificationsEnabled,
      profileImage
    } = req.body;

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields (only if provided)
    if (name !== undefined) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (carrier !== undefined) user.carrier = carrier;
    if (smsNotificationsEnabled !== undefined) user.smsNotificationsEnabled = smsNotificationsEnabled;
    if (emailNotificationsEnabled !== undefined) user.emailNotificationsEnabled = emailNotificationsEnabled;
    if (profileImage !== undefined) user.profileImage = profileImage;
    
    // Validate SMS settings: If SMS is enabled, require phone number and carrier
    if (user.smsNotificationsEnabled && (!user.phoneNumber || !user.carrier)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and carrier are required for SMS notifications'
      });
    }

    // Save the user
    await user.save();

    // Return the updated user object (excluding password)
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        carrier: user.carrier,
        smsNotificationsEnabled: user.smsNotificationsEnabled,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    console.error('Update user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

/**
 * @desc    Change logged-in user password
 * @route   PUT /api/users/me/password
 * @access  Private
 */
exports.changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    // Get user with password (password is normally excluded from queries)
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Update password
    user.password = newPassword; // Model pre-save hook will hash it

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 