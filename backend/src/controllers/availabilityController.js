const Availability = require('../models/Availability');
const VisitingVetProfile = require('../models/VisitingVetProfile');

/**
 * @desc    Get current provider's availability
 * @route   GET /api/availability/me
 * @access  Private (MVSProvider)
 */
const getMyAvailability = async (req, res) => {
  try {
    // Find provider's profile
    const profile = await VisitingVetProfile.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Provider profile not found. Please create a profile first.' 
      });
    }
    
    // Find availability linked to this profile
    const availability = await Availability.findOne({ profile: profile._id });
    
    if (!availability) {
      return res.status(200).json({ 
        success: true, 
        data: { weeklySchedule: [], specialDates: [] },
        message: 'No availability schedule has been set up yet.' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching availability'
    });
  }
};

/**
 * @desc    Set/update provider's availability
 * @route   POST /api/availability/me
 * @access  Private (MVSProvider)
 */
const updateAvailability = async (req, res) => {
  try {
    const { weeklySchedule, specialDates } = req.body;
    
    // Validate weeklySchedule
    if (weeklySchedule) {
      // Check if it's an array
      if (!Array.isArray(weeklySchedule)) {
        return res.status(400).json({
          success: false,
          message: 'Weekly schedule must be an array'
        });
      }
      
      // Validate each day entry
      for (const day of weeklySchedule) {
        if (
          day.dayOfWeek === undefined || 
          day.dayOfWeek < 0 || 
          day.dayOfWeek > 6 ||
          !day.startTime ||
          !day.endTime ||
          !day.startTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) ||
          !day.endTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        ) {
          return res.status(400).json({
            success: false,
            message: 'Invalid day schedule format'
          });
        }
      }
    }
    
    // Find provider's profile
    const profile = await VisitingVetProfile.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Provider profile not found. Please create a profile first.' 
      });
    }
    
    // Find if availability document already exists
    let availability = await Availability.findOne({ profile: profile._id });
    
    // If it exists, update it
    if (availability) {
      if (weeklySchedule) {
        availability.weeklySchedule = weeklySchedule;
      }
      
      if (specialDates) {
        availability.specialDates = specialDates;
      }
      
      await availability.save();
    } else {
      // Create new availability document
      availability = await Availability.create({
        profile: profile._id,
        weeklySchedule: weeklySchedule || [],
        specialDates: specialDates || []
      });
    }
    
    res.status(200).json({
      success: true,
      data: availability,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating availability'
    });
  }
};

/**
 * @desc    Get provider's availability by ID (for clients/appointment scheduling)
 * @route   GET /api/availability/:profileId
 * @access  Public
 */
const getProviderAvailability = async (req, res) => {
  try {
    const { profileId } = req.params;
    
    // Find availability linked to this profile
    const availability = await Availability.findOne({ profile: profileId });
    
    if (!availability) {
      return res.status(404).json({ 
        success: false, 
        message: 'No availability found for this provider.' 
      });
    }
    
    // For public endpoints, we may want to exclude some fields
    // or transform the data for client consumption
    const publicAvailability = {
      weeklySchedule: availability.weeklySchedule,
      // We might exclude specialDates or only include certain fields
    };
    
    res.status(200).json({
      success: true,
      data: publicAvailability
    });
  } catch (error) {
    console.error('Error fetching provider availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching provider availability'
    });
  }
};

module.exports = {
  getMyAvailability,
  updateAvailability,
  getProviderAvailability
}; 