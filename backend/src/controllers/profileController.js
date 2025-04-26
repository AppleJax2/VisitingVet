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

/**
 * @desc    Search for visiting vet profiles
 * @route   GET /api/profiles/visiting-vet/search
 * @access  Public
 */
const searchProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Number of results per page
    const skip = (page - 1) * limit;

    const { search, animalTypes, specialtyServices, location } = req.query;

    const query = {};

    // Simple text search (can be expanded to use $text index later)
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      query.$or = [
        { businessName: searchRegex },
        { bio: searchRegex },
        { serviceAreaDescription: searchRegex },
        { licenseInfo: searchRegex }, // May want to refine search fields
        // Add search on related User's name? Requires lookup/aggregation
      ];
    }

    // Filter by animal types (expects comma-separated string)
    if (animalTypes) {
      query.animalTypes = { $in: animalTypes.split(',') };
    }

    // Filter by specialty services (expects comma-separated string)
    if (specialtyServices) {
      query.specialtyServices = { $in: specialtyServices.split(',') };
    }

    // Basic location filter by ZIP code (can be expanded to radius search)
    if (location) { // Assuming location is a ZIP code for now
      query.serviceAreaZipCodes = location; // Check if 'location' matches any in the array
      // For more complex radius search: query.location = { $near: { $geometry: { type: "Point", coordinates: [lon, lat] }, $maxDistance: radiusKm * 1000 } };
      // This requires storing location as a GeoJSON point in the profile model.
    }

    // Ensure we only search for profiles of MVSProviders (redundant if profiles only exist for them, but good practice)
    const providerUserIds = await User.find({ role: 'MVSProvider' }).select('_id').lean();
    query.user = { $in: providerUserIds.map(u => u._id) };

    const total = await VisitingVetProfile.countDocuments(query);
    const profiles = await VisitingVetProfile.find(query)
      .populate({
        path: 'user',
        select: 'name email profileImage', // Select relevant public user fields
      })
      .populate('services') // Populate services if needed for display
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Or sort by relevance/name?

    res.status(200).json({
      success: true,
      count: profiles.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: profiles,
    });
  } catch (error) {
    console.error('Error searching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error during profile search',
      error: error.message,
    });
  }
};

module.exports = {
  createUpdateProfile,
  getMyProfile,
  getProfileById,
  listProfiles,
  searchProfiles,
}; 