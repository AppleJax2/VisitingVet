const VisitingVetProfile = require('../models/VisitingVetProfile');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Create or update profile for logged-in visiting vet
// @route   POST /api/profiles/visiting-vet
// @access  Private (Visiting Vet Provider only)
const createUpdateProfile = async (req, res) => {
  try {
    // Check if profile already exists for this user
    let profile = await VisitingVetProfile.findOne({ user: req.user._id });
    const {
      bio,
      credentials,
      yearsExperience,
      photoUrl,
      serviceAreaDescription,
      serviceAreaRadiusKm,
      serviceAreaZipCodes,
      licenseInfo,
      insuranceInfo,
      clinicAffiliations,
    } = req.body;

    // If profile exists, update it
    if (profile) {
      profile = await VisitingVetProfile.findOneAndUpdate(
        { user: req.user._id },
        {
          bio,
          credentials,
          yearsExperience,
          photoUrl,
          serviceAreaDescription,
          serviceAreaRadiusKm,
          serviceAreaZipCodes,
          licenseInfo,
          insuranceInfo,
          clinicAffiliations,
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = await VisitingVetProfile.create({
        user: req.user._id,
        bio,
        credentials,
        yearsExperience,
        photoUrl,
        serviceAreaDescription,
        serviceAreaRadiusKm,
        serviceAreaZipCodes,
        licenseInfo,
        insuranceInfo,
        clinicAffiliations,
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get logged-in visiting vet's own profile
// @route   GET /api/profiles/visiting-vet/me
// @access  Private (Visiting Vet Provider only)
const getMyProfile = async (req, res) => {
  try {
    const profile = await VisitingVetProfile.findOne({ user: req.user._id })
      .populate('services');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get a specific visiting vet's public profile
// @route   GET /api/profiles/visiting-vet/:id
// @access  Public
const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user || user.role !== 'MVSProvider') {
      return res.status(404).json({
        success: false,
        message: 'Visiting vet provider not found',
      });
    }

    const profile = await VisitingVetProfile.findOne({ user: req.params.id })
      .populate('services');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Get basic user info to include with profile
    const publicUserInfo = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      success: true,
      profile: {
        ...profile.toObject(),
        user: publicUserInfo,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    List/search all visiting vet profiles
// @route   GET /api/profiles/visiting-vet
// @access  Public
const listProfiles = async (req, res) => {
  try {
    // Basic implementation for now - just list all profiles
    // Will add filtering and pagination in the future
    const profiles = await VisitingVetProfile.find()
      .populate({
        path: 'user',
        select: 'email',  // Only return non-sensitive info
      })
      .populate('services');

    res.status(200).json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

module.exports = {
  createUpdateProfile,
  getMyProfile,
  getProfileById,
  listProfiles,
}; 