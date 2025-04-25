const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  requestAppointment,
  getMyPetOwnerAppointments,
  getMyAppointmentsProvider,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

// Protected routes (require authentication)
router.post('/', protect, authorize('PetOwner'), requestAppointment);
router.get('/my-appointments', protect, authorize('PetOwner'), getMyPetOwnerAppointments);

// Provider routes
router.get('/provider', protect, authorize('MVSProvider'), getMyAppointmentsProvider);
router.put('/:appointmentId/status', protect, authorize('MVSProvider'), updateAppointmentStatus);

module.exports = router; 