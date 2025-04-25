const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  requestAppointment,
  getMyPetOwnerAppointments,
} = require('../controllers/appointmentController');

// Protected routes (require authentication)
router.post('/', protect, authorize('PetOwner'), requestAppointment);
router.get('/my-appointments', protect, authorize('PetOwner'), getMyPetOwnerAppointments);

module.exports = router; 