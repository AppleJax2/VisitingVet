const Appointment = require('../models/Appointment');
const VisitingVetProfile = require('../models/VisitingVetProfile');
const Service = require('../models/Service');
const Availability = require('../models/Availability');
const User = require('../models/User');
const notificationService = require('../utils/notificationService');

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
    const { providerProfileId, serviceId, appointmentTime, notes, animalDetails, customFieldResponses } = req.body;
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

    // If provider uses external scheduling, don't allow appointment creation
    if (providerProfile.useExternalScheduling) {
      return res.status(400).json({
        success: false,
        error: 'This provider uses external scheduling. Please contact them directly.'
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

    // Validate that appointment time is in the future
    const now = new Date();
    if (requestedTime <= now) {
      return res.status(400).json({
        success: false,
        error: 'Appointment time must be in the future'
      });
    }
    
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
      status: 'Requested',
      animalDetails: animalDetails || {},
      customFieldResponses: customFieldResponses || []
    });

    // Send notifications
    await notificationService.sendAppointmentNotification({
      appointmentId: appointment._id,
      notificationType: 'Created'
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

// @desc    Get provider's appointments
// @route   GET /api/appointments/provider
// @access  Private (MVSProvider)
exports.getMyAppointmentsProvider = async (req, res) => {
  try {
    // Check if user is a MVSProvider
    const user = await User.findById(req.user.id);
    if (user.role !== 'MVSProvider') {
      return res.status(403).json({
        success: false,
        error: 'Only veterinary providers can access their appointments'
      });
    }
    
    // Find the provider's profile
    const providerProfile = await VisitingVetProfile.findOne({ user: req.user.id });
    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Provider profile not found'
      });
    }
    
    // Optional status filter
    const statusFilter = req.query.status ? { status: req.query.status } : {};
    
    // Get all appointments for this provider
    const appointments = await Appointment.find({
      providerProfile: providerProfile._id,
      ...statusFilter
    })
      .populate({
        path: 'petOwner',
        select: 'email' // Include only basic user info
      })
      .populate('service')
      .sort({ appointmentTime: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching provider appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:appointmentId/status
// @access  Private (MVSProvider)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, completionNotes, followUpRecommended, followUpNotes, cancellationReason } = req.body;
    
    // Validate required fields
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    // Validate status value
    const validStatuses = ['Confirmed', 'Cancelled', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Check if user is a MVSProvider
    const user = await User.findById(req.user.id);
    if (user.role !== 'MVSProvider') {
      return res.status(403).json({
        success: false,
        error: 'Only veterinary providers can update appointment status'
      });
    }
    
    // Find the provider's profile
    const providerProfile = await VisitingVetProfile.findOne({ user: req.user.id });
    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Provider profile not found'
      });
    }
    
    // Find the appointment and ensure it belongs to this provider
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      providerProfile: providerProfile._id
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found or does not belong to this provider'
      });
    }
    
    // Validate state transitions
    if (appointment.status === 'Cancelled' || appointment.status === 'Completed' || appointment.status === 'CancelledByOwner') {
      return res.status(400).json({
        success: false,
        error: `Cannot update an appointment with status '${appointment.status}'`
      });
    }
    
    // Update the appointment status
    appointment.status = status;

    // Add additional details based on the status
    if (status === 'Cancelled') {
      appointment.cancellationReason = cancellationReason || '';
      appointment.cancelledBy = 'Provider';
      appointment.cancellationTime = new Date();
    } else if (status === 'Completed') {
      appointment.completionNotes = completionNotes || '';
      appointment.followUpRecommended = followUpRecommended || false;
      appointment.followUpNotes = followUpNotes || '';
    }
    
    await appointment.save();

    // Send notifications
    await notificationService.sendAppointmentNotification({
      appointmentId: appointment._id,
      notificationType: status === 'Confirmed' ? 'Updated' : status
    });
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Cancel appointment by pet owner
// @route   PUT /api/appointments/:appointmentId/cancel
// @access  Private (PetOwner)
exports.cancelAppointmentByPetOwner = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { cancellationReason } = req.body;
    
    // Check if user is a PetOwner
    const user = await User.findById(req.user.id);
    if (user.role !== 'PetOwner') {
      return res.status(403).json({
        success: false,
        error: 'Only pet owners can cancel their appointments'
      });
    }
    
    // Find the appointment and ensure it belongs to this pet owner
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      petOwner: req.user.id
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found or does not belong to you'
      });
    }
    
    // Validate state transitions
    if (appointment.status === 'Cancelled' || appointment.status === 'Completed' || appointment.status === 'CancelledByOwner') {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel an appointment with status '${appointment.status}'`
      });
    }
    
    // Only allow cancellation if appointment is in the future (at least 24 hours before)
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentTime);
    const timeDifference = appointmentTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    
    // Check if appointment is less than 24 hours away
    if (hoursDifference < 24) {
      return res.status(400).json({
        success: false,
        error: 'Appointments can only be cancelled at least 24 hours in advance'
      });
    }
    
    // Update the appointment status
    appointment.status = 'CancelledByOwner';
    appointment.cancellationReason = cancellationReason || '';
    appointment.cancelledBy = 'PetOwner';
    appointment.cancellationTime = new Date();
    
    await appointment.save();

    // Send notifications
    await notificationService.sendAppointmentNotification({
      appointmentId: appointment._id,
      notificationType: 'Cancelled',
      message: `Appointment was cancelled by the pet owner${cancellationReason ? ': ' + cancellationReason : ''}.`
    });
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get appointment details
// @route   GET /api/appointments/:appointmentId
// @access  Private (PetOwner/MVSProvider)
exports.getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('petOwner', 'email')
      .populate({
        path: 'providerProfile',
        select: 'bio yearsExperience photoUrl licenseInfo businessName animalTypes',
        populate: { path: 'user', select: 'email' }
      })
      .populate('service');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    // Check authorization
    if (
      appointment.petOwner._id.toString() !== req.user.id &&
      appointment.providerProfile.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this appointment'
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 