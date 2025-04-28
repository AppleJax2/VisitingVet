const Service = require('../models/Service');
const VisitingVetProfile = require('../models/VisitingVetProfile');

// @desc    Create a service for a visiting vet profile
// @route   POST /api/profiles/visiting-vet/services
// @access  Private (Visiting Vet Provider only)
const createService = async (req, res) => {
  try {
    // Find the provider's profile
    const profile = await VisitingVetProfile.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please create a profile first',
      });
    }

    const {
      name,
      description,
      estimatedDurationMinutes,
      price,
      priceType, 
      offeredLocation,
      animalType,
      deliveryMethod,
      isSpecialtyService,
      specialtyType,
    } = req.body;

    // Create the service linked to the profile
    const serviceData = {
      profile: profile._id,
      name,
      description,
      estimatedDurationMinutes,
      price,
      priceType,
      offeredLocation,
      animalType,
      deliveryMethod,
      isSpecialtyService,
      specialtyType,
    };
    
    // Conditionally set pricing based on hasDifferentPricing if provided
    if (req.body.hasDifferentPricing !== undefined) {
      serviceData.hasDifferentPricing = req.body.hasDifferentPricing;
      if (req.body.hasDifferentPricing) {
        serviceData.b2bPrice = req.body.b2bPrice;
        serviceData.b2cPrice = req.body.b2cPrice;
        // Clear the generic price if different pricing is used
        delete serviceData.price;
      } else {
        serviceData.price = req.body.price;
        delete serviceData.b2bPrice;
        delete serviceData.b2cPrice;
      }
    }
    
    if (req.body.customFields) {
        serviceData.customFields = req.body.customFields;
    }

    const service = await Service.create(serviceData);

    res.status(201).json({
      success: true,
      service,
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

// @desc    Update a service
// @route   PUT /api/profiles/visiting-vet/services/:serviceId
// @access  Private (Visiting Vet Provider only)
const updateService = async (req, res) => {
  try {
    // First find the provider's profile
    const profile = await VisitingVetProfile.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Find the service and verify it belongs to this profile
    const service = await Service.findById(req.params.serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Check if the service belongs to this provider's profile
    if (service.profile.toString() !== profile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service',
      });
    }

    const {
      name,
      description,
      estimatedDurationMinutes,
      price,
      priceType,
      offeredLocation,
      animalType,
      deliveryMethod,
      isSpecialtyService,
      specialtyType,
    } = req.body;

    // Build update object selectively based on provided fields
    const updateData = {};
    const allowedFields = [
        'name', 'description', 'estimatedDurationMinutes', 'price', 'priceType', 
        'offeredLocation', 'animalType', 'deliveryMethod', 'isSpecialtyService', 
        'specialtyType', 'hasDifferentPricing', 'b2bPrice', 'b2cPrice', 'customFields'
    ];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    // Handle pricing logic for updates too
    if (updateData.hasDifferentPricing !== undefined) {
      if (updateData.hasDifferentPricing) {
        updateData.price = undefined; // Ensure generic price is removed/ignored
      } else {
        updateData.b2bPrice = undefined; 
        updateData.b2cPrice = undefined;
      }
    } else if (updateData.price !== undefined && service.hasDifferentPricing) {
        // If updating generic price but service used different pricing, switch back
        updateData.hasDifferentPricing = false;
        updateData.b2bPrice = undefined;
        updateData.b2cPrice = undefined;
    }

    // Update the service
    const updatedService = await Service.findByIdAndUpdate(
      req.params.serviceId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      service: updatedService,
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

// @desc    Delete a service
// @route   DELETE /api/profiles/visiting-vet/services/:serviceId
// @access  Private (Visiting Vet Provider only)
const deleteService = async (req, res) => {
  try {
    // First find the provider's profile
    const profile = await VisitingVetProfile.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Find the service and verify it belongs to this profile
    const service = await Service.findById(req.params.serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Check if the service belongs to this provider's profile
    if (service.profile.toString() !== profile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service',
      });
    }

    // Delete the service
    await Service.findByIdAndDelete(req.params.serviceId);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
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

// @desc    Get all services for a specific profile
// @route   GET /api/profiles/visiting-vet/:profileId/services
// @access  Public
const getServicesByProfile = async (req, res) => {
  try {
    const services = await Service.find({ profile: req.params.profileId });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
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
  createService,
  updateService,
  deleteService,
  getServicesByProfile,
}; 