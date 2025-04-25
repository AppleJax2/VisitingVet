const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  requestAppointment,
  getMyPetOwnerAppointments,
  getMyAppointmentsProvider,
  updateAppointmentStatus,
  cancelAppointmentByPetOwner,
  getAppointmentDetails
} = require('../controllers/appointmentController');

// Protected routes (require authentication)
router.post('/', protect, authorize('PetOwner'), requestAppointment);
router.get('/my-appointments', protect, authorize('PetOwner'), getMyPetOwnerAppointments);

// Provider routes
router.get('/provider', protect, authorize('MVSProvider'), getMyAppointmentsProvider);
router.put('/:appointmentId/status', protect, authorize('MVSProvider'), updateAppointmentStatus);

// Pet owner cancellation route
router.put('/:appointmentId/cancel', protect, authorize('PetOwner'), cancelAppointmentByPetOwner);

// Appointment details route (accessible by both provider and pet owner)
router.get('/:appointmentId', protect, getAppointmentDetails);

module.exports = router; 