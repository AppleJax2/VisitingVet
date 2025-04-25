const Appointment = require('../models/Appointment');
const VisitingVetProfile = require('../models/VisitingVetProfile');
const Service = require('../models/Service');
const Availability = require('../models/Availability');
const User = require('../models/User');

// Helper function to check if the requested time is within provider's availability
const isTimeWithinAvailability = (availability, requestedDate, serviceDuration) => {
  const dayOfWeek = requestedDate.getDay(); // 0 (Sunday) to 6 (Saturday)
  const hours = requestedDate.getHours();
  const minutes = requestedDate.getMinutes();
  const requestedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  // Check against weekly schedule
  const daySchedule = availability.weeklySchedule.find(
    schedule => schedule.dayOfWeek === dayOfWeek && schedule.isAvailable
  );
  
  if (!daySchedule) {
    return false; // Day not available
  }
  
  // Parse time strings to minutes since midnight for easy comparison
  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const startMinutes = parseTimeToMinutes(daySchedule.startTime);
  const endMinutes = parseTimeToMinutes(daySchedule.endTime);
  const requestedMinutes = parseTimeToMinutes(requestedTime);
  const durationMinutes = serviceDuration;
  
  // Check if appointment (including duration) fits within available hours
  return (
    requestedMinutes >= startMinutes &&
    requestedMinutes + durationMinutes <= endMinutes
  );
};

// Helper function to check for appointment conflicts
const hasAppointmentConflict = async (providerProfileId, startTime, endTime) => {
  const conflictingAppointments = await Appointment.find({
    providerProfile: providerProfileId,
    status: { $in: ['Requested', 'Confirmed'] },
    $or: [
      // Requested appointment starts during an existing appointment
      {
        appointmentTime: { $lte: startTime },
        estimatedEndTime: { $gt: startTime }
      },
      // Requested appointment ends during an existing appointment
      {
        appointmentTime: { $lt: endTime },
        estimatedEndTime: { $gte: endTime }
      },
      // Requested appointment entirely contains an existing appointment
      {
        appointmentTime: { $gte: startTime },
        estimatedEndTime: { $lte: endTime }
      }
    ]
  });
  
  return conflictingAppointments.length > 0;
};

// @desc    Request a new appointment
// @route   POST /api/appointments
// @access  Private (PetOwner)
exports.requestAppointment = async (req, res) => {
  try {
    const { providerProfileId, serviceId, appointmentTime, notes } = req.body;
    const requestedTime = new Date(appointmentTime);
    
    // Validate required fields
    if (!providerProfileId || !serviceId || !appointmentTime) {
      return res.status(400).json({
        success: false,
        error: 'Provider profile ID, service ID, and appointment time are required'
      });
    }
    
    // Check if provider profile exists
    const providerProfile = await VisitingVetProfile.findById(providerProfileId);
    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Provider profile not found'
      });
    }
    
    // Check if service exists and belongs to the provider
    const service = await Service.findOne({
      _id: serviceId,
      profile: providerProfileId
    });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found or does not belong to this provider'
      });
    }
    
    // Check if user is a PetOwner
    const user = await User.findById(req.user.id);
    if (user.role !== 'PetOwner') {
      return res.status(403).json({
        success: false,
        error: 'Only pet owners can request appointments'
      });
    }
    
    // Get provider's availability
    const availability = await Availability.findOne({ profile: providerProfileId });
    if (!availability) {
      return res.status(404).json({
        success: false,
        error: 'Provider has not set their availability'
      });
    }
    
    // Calculate estimated end time
    const estimatedEndTime = new Date(requestedTime);
    estimatedEndTime.setMinutes(
      estimatedEndTime.getMinutes() + service.estimatedDurationMinutes
    );
    
    // Check if requested time is within provider's availability
    if (!isTimeWithinAvailability(
      availability, 
      requestedTime, 
      service.estimatedDurationMinutes
    )) {
      return res.status(400).json({
        success: false,
        error: 'The requested time is outside the provider\'s availability'
      });
    }
    
    // Check for conflicts with existing appointments
    const hasConflict = await hasAppointmentConflict(
      providerProfileId,
      requestedTime,
      estimatedEndTime
    );
    
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        error: 'The requested time conflicts with another appointment'
      });
    }
    
    // Create the appointment
    const appointment = await Appointment.create({
      petOwner: req.user.id,
      providerProfile: providerProfileId,
      service: serviceId,
      appointmentTime: requestedTime,
      estimatedEndTime,
      notes: notes || '',
      status: 'Requested'
    });
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error requesting appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get pet owner's appointments
// @route   GET /api/appointments/my-appointments
// @access  Private (PetOwner)
exports.getMyPetOwnerAppointments = async (req, res) => {
  try {
    // Check if user is a PetOwner
    const user = await User.findById(req.user.id);
    if (user.role !== 'PetOwner') {
      return res.status(403).json({
        success: false,
        error: 'Only pet owners can access their appointments'
      });
    }
    
    // Get all appointments for this pet owner
    const appointments = await Appointment.find({ petOwner: req.user.id })
      .populate({
        path: 'providerProfile',
        populate: { path: 'user', select: 'email' }
      })
      .populate('service')
      .sort({ appointmentTime: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching pet owner appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 