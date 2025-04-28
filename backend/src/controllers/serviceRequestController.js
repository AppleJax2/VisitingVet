const ServiceRequest = require('../models/ServiceRequest');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendNotification } = require('../utils/notificationService');

// Create a new service request (from clinic to provider)
exports.createServiceRequest = async (req, res) => {
  try {
    const { 
      petId, 
      petOwnerId, 
      providerId, 
      requestedServices, 
      medicalNotes, 
      urgency, 
      preferredDates 
    } = req.body;

    // The clinic creating the request is the logged-in user
    const clinicId = req.user.id;

    // Create the service request
    const serviceRequest = await ServiceRequest.create({
      clinic: clinicId,
      pet: petId,
      petOwner: petOwnerId,
      provider: providerId,
      requestedServices,
      medicalNotes,
      urgency,
      preferredDates,
      status: 'pending'
    });

    // Notify the provider
    await sendNotification({
      recipient: providerId,
      type: 'SERVICE_REQUEST',
      title: 'New service request',
      message: `You have received a new service request from a clinic`,
      linkUrl: `/dashboard/provider/service-requests/${serviceRequest._id}`,
      isRead: false
    });

    return res.status(201).json({
      success: true,
      data: serviceRequest
    });
  } catch (error) {
    console.error('Error creating service request:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all service requests for the logged-in user based on their role
exports.getUserServiceRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let query = {};

    // Set query based on user role
    if (userRole === 'clinic') {
      query.clinic = userId;
    } else if (userRole === 'provider') {
      query.provider = userId;
    } else if (userRole === 'pet_owner') {
      query.petOwner = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized role'
      });
    }

    const serviceRequests = await ServiceRequest.find(query)
      .populate('clinic', 'name email phone')
      .populate('petOwner', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('pet', 'name species breed')
      .populate('requestedServices.service')
      .populate('scheduledAppointment')
      .sort('-createdAt');

    return res.status(200).json({
      success: true,
      count: serviceRequests.length,
      data: serviceRequests
    });
  } catch (error) {
    console.error('Error getting service requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single service request by ID
exports.getServiceRequestById = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id)
      .populate('clinic', 'name email phone')
      .populate('petOwner', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('pet', 'name species breed age')
      .populate('requestedServices.service')
      .populate('scheduledAppointment')
      .populate('attachments.uploadedBy', 'name'); // Populate uploader name

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Verify user has permission (must be one of the three parties involved or admin)
    const userId = req.user.id;
    const isClinic = serviceRequest.clinic.toString() === userId;
    const isProvider = serviceRequest.provider.toString() === userId;
    const isPetOwner = serviceRequest.petOwner.toString() === userId;
    const isAdmin = req.user.role === 'Admin'; // Note: Capital 'A' based on previous codebase usage

    if (!isClinic && !isProvider && !isPetOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this service request'
      });
    }

    return res.status(200).json({
      success: true,
      data: serviceRequest
    });
  } catch (error) {
    console.error('Error getting service request:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Provider responds to a service request
exports.providerResponse = async (req, res) => {
  try {
    const { status, message, availableTimeSlots } = req.body;
    const providerId = req.user.id;

    // Find the service request
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Verify that the logged-in user is the provider
    if (serviceRequest.provider.toString() !== providerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this service request'
      });
    }

    // Ensure status is valid
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid response status' });
    }

    // Ensure availableTimeSlots are provided if accepting
    if (status === 'accepted' && (!availableTimeSlots || availableTimeSlots.length === 0)) {
      return res.status(400).json({ success: false, message: 'Available time slots are required when accepting' });
    }

    // Update the service request with provider's response
    serviceRequest.providerResponse = {
      status,
      message: message || '',
      respondedAt: Date.now(),
      availableTimeSlots: status === 'accepted' ? availableTimeSlots : []
    };

    // Update overall status based on provider response
    serviceRequest.status = status;

    await serviceRequest.save();

    // Notify the clinic and pet owner about the provider's response
    const notificationMessage = status === 'accepted' 
      ? 'Provider has accepted your service request and provided available time slots' 
      : 'Provider has declined your service request';

    // Notify clinic
    await sendNotification({
      recipient: serviceRequest.clinic,
      type: 'SERVICE_REQUEST_UPDATE',
      title: 'Service request update',
      message: notificationMessage,
      linkUrl: `/dashboard/clinic/service-requests/${serviceRequest._id}`,
      isRead: false
    });

    // If accepted, notify pet owner to select time slot
    if (status === 'accepted') {
      await sendNotification({
        recipient: serviceRequest.petOwner,
        type: 'SERVICE_REQUEST_UPDATE',
        title: 'Service request available',
        message: 'A provider has accepted a service request for your pet. Please select an available time slot.',
        linkUrl: `/dashboard/pet-owner/service-requests/${serviceRequest._id}`,
        isRead: false
      });
    }

    return res.status(200).json({
      success: true,
      data: serviceRequest
    });
  } catch (error) {
    console.error('Error updating service request:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Pet owner selects a time slot
exports.petOwnerResponse = async (req, res) => {
  try {
    const { status, selectedTimeSlot } = req.body;
    const petOwnerId = req.user.id;

    // Find the service request
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Verify that the logged-in user is the pet owner
    if (serviceRequest.petOwner.toString() !== petOwnerId) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this service request' });
    }

    // Check if the request status is 'accepted' (only then can the owner respond)
    if (serviceRequest.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Cannot respond to this request in its current state' });
    }
    
    // Ensure status is valid
    if (!['selected', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid response status' });
    }

    // Ensure a time slot is provided if selecting
    if (status === 'selected' && !selectedTimeSlot) {
      return res.status(400).json({ success: false, message: 'A time slot must be selected' });
    }

    // Update the service request with pet owner's response
    serviceRequest.petOwnerResponse = {
      status,
      selectedTimeSlot: status === 'selected' ? selectedTimeSlot : null,
      respondedAt: Date.now()
    };

    // If pet owner declined, update the overall status
    if (status === 'declined') {
      serviceRequest.status = 'cancelled';
    } 
    // If pet owner selected a time slot, create an appointment and update status
    else if (status === 'selected' && selectedTimeSlot) {
      // Verify the selected time slot is one of the provider's available slots
      const isValidSlot = serviceRequest.providerResponse?.availableTimeSlots?.some(
        slot => 
          new Date(slot.date).toISOString().split('T')[0] === new Date(selectedTimeSlot.date).toISOString().split('T')[0] && 
          slot.timeSlot === selectedTimeSlot.timeSlot
      );
      
      if (!isValidSlot) {
        return res.status(400).json({ success: false, message: 'Invalid time slot selected' });
      }

      // Create a new appointment
      const appointment = await Appointment.create({
        provider: serviceRequest.provider,
        petOwner: serviceRequest.petOwner,
        pet: serviceRequest.pet,
        date: new Date(selectedTimeSlot.date), // Ensure date is stored correctly
        timeSlot: selectedTimeSlot.timeSlot,
        status: 'Confirmed', // Directly confirm the appointment
        services: serviceRequest.requestedServices.map(rs => rs.service),
        notes: serviceRequest.medicalNotes, // Copy notes from request
        initiatedBy: 'Clinic',
        referringClinic: serviceRequest.clinic
      });

      // Update the service request with the appointment and status
      serviceRequest.scheduledAppointment = appointment._id;
      serviceRequest.status = 'scheduled';
      
      // Notify the provider about the scheduled appointment
      await sendNotification({
        recipient: serviceRequest.provider,
        type: 'APPOINTMENT_SCHEDULED',
        title: 'Appointment scheduled',
        message: `An appointment has been scheduled for pet ${serviceRequest.pet.name}`,
        linkUrl: `/dashboard/provider/appointments/${appointment._id}`,
        isRead: false
      });
      
      // Notify the clinic about the scheduled appointment
      await sendNotification({
        recipient: serviceRequest.clinic,
        type: 'SERVICE_REQUEST_SCHEDULED',
        title: 'Service request scheduled',
        message: `Pet owner scheduled appointment for request #${serviceRequest._id.substring(serviceRequest._id.length - 6)}`,
        linkUrl: `/dashboard/clinic/service-requests/${serviceRequest._id}`,
        isRead: false
      });
    }

    await serviceRequest.save();

    return res.status(200).json({
      success: true,
      data: serviceRequest
    });
  } catch (error) {
    console.error('Error updating service request:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update the service request status (used by any party to mark complete/cancel)
exports.updateServiceRequestStatus = async (req, res) => {
  try {
    const { status, resultNotes } = req.body;
    const userId = req.user.id;

    // Find the service request
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Verify user authorization
    const isClinic = serviceRequest.clinic.toString() === userId;
    const isProvider = serviceRequest.provider.toString() === userId;
    const isPetOwner = serviceRequest.petOwner.toString() === userId;
    const isAdmin = req.user.role === 'Admin';

    if (!isClinic && !isProvider && !isPetOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this service request' });
    }

    // Validate the new status
    if (!['completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }
    
    // Check if status transition is valid
    const allowedTransitions = {
      scheduled: ['completed', 'cancelled'],
      accepted: ['cancelled'],
      pending: ['cancelled'],
    };

    if (!allowedTransitions[serviceRequest.status] || !allowedTransitions[serviceRequest.status].includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot change status from ${serviceRequest.status} to ${status}` });
    }

    // Provider should add result notes when marking as completed
    if (status === 'completed' && isProvider && !resultNotes) {
      return res.status(400).json({ success: false, message: 'Result notes are required when marking as completed' });
    }

    // Update the status
    serviceRequest.status = status;
    
    // If completing, add result notes (only if provided)
    if (status === 'completed' && resultNotes) {
      serviceRequest.resultNotes = resultNotes;
    }

    await serviceRequest.save();

    // Notify all parties about the status change
    const parties = [
      serviceRequest.clinic, 
      serviceRequest.provider, 
      serviceRequest.petOwner
    ].filter(id => id.toString() !== userId);

    // Generate message based on status
    let message = '';
    if (status === 'completed') {
      message = `Service request #${serviceRequest._id.substring(serviceRequest._id.length - 6)} has been marked as completed`;
    } else if (status === 'cancelled') {
      message = `Service request #${serviceRequest._id.substring(serviceRequest._id.length - 6)} has been cancelled`;
    } else {
      message = `The service request status has been updated to ${status}`;
    }

    // Send notifications to all parties except the updater
    for (const recipientId of parties) {
      const recipient = await User.findById(recipientId);
      if (!recipient) continue; // Skip if recipient not found
      
      let rolePath = '';
      switch (recipient.role) {
        case 'Clinic': rolePath = 'clinic'; break;
        case 'MVSProvider': rolePath = 'provider'; break;
        case 'PetOwner': rolePath = 'pet-owner'; break;
        default: rolePath = 'unknown';
      }
      
      const linkUrl = `/dashboard/${rolePath}/service-requests/${serviceRequest._id}`;
      
      await sendNotification({
        recipient: recipientId,
        type: 'SERVICE_REQUEST_UPDATE',
        title: 'Service request update',
        message,
        linkUrl,
        isRead: false
      });
    }

    return res.status(200).json({
      success: true,
      data: serviceRequest
    });
  } catch (error) {
    console.error('Error updating service request status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add attachment to service request (by any party)
exports.addAttachment = async (req, res) => {
  try {
    const { name, fileUrl } = req.body;
    const userId = req.user.id;

    // Find the service request
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    // Verify user authorization
    const isClinic = serviceRequest.clinic.toString() === userId;
    const isProvider = serviceRequest.provider.toString() === userId;
    const isPetOwner = serviceRequest.petOwner.toString() === userId;
    const isAdmin = req.user.role === 'Admin';

    if (!isClinic && !isProvider && !isPetOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to add attachments to this service request' });
    }

    // Validate input
    if (!name || !fileUrl) {
        return res.status(400).json({ success: false, message: 'Attachment name and URL are required' });
    }

    // Add attachment
    const attachment = {
      name,
      fileUrl,
      uploadedAt: Date.now(),
      uploadedBy: userId
    };

    serviceRequest.attachments.push(attachment);
    await serviceRequest.save();

    // Populate the newly added attachment's uploader info before sending back
    await ServiceRequest.populate(serviceRequest, { path: 'attachments.uploadedBy', select: 'name' });

    return res.status(200).json({
      success: true,
      data: serviceRequest
    });
  } catch (error) {
    console.error('Error adding attachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get statistics on service requests for admin dashboard
exports.getServiceRequestStats = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these statistics'
      });
    }

    // Get counts by status
    const statusCounts = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get counts by urgency
    const urgencyCounts = await ServiceRequest.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get average time from request to completion
    const completedRequests = await ServiceRequest.find({ status: 'completed' });
    let avgCompletionTime = 0;
    
    if (completedRequests.length > 0) {
      const totalCompletionTime = completedRequests.reduce((total, request) => {
        const createdAt = new Date(request.createdAt).getTime();
        const updatedAt = new Date(request.updatedAt).getTime();
        return total + (updatedAt - createdAt);
      }, 0);
      
      avgCompletionTime = totalCompletionTime / completedRequests.length / (1000 * 60 * 60); // in hours
    }

    const totalRequests = await ServiceRequest.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        statusCounts,
        urgencyCounts,
        avgCompletionTime: avgCompletionTime.toFixed(2), // Format to 2 decimal places
        totalRequests
      }
    });
  } catch (error) {
    console.error('Error getting service request stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 