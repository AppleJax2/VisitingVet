const express = require('express');
const {
  getClinicAppointments,
  getClinicStaff
} = require('../controllers/clinicController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Correctly import authorize

const router = express.Router();

// Apply authentication and role restriction (Clinic) to all clinic routes
router.use(protect, authorize('Clinic')); // Use authorize instead of restrictTo

router.route('/appointments').get(getClinicAppointments);
router.route('/staff').get(getClinicStaff);

// TODO: Add routes for managing staff, inventory, clinic profile, etc.
// Example: router.route('/staff').post(addClinicStaff);
// Example: router.route('/staff/:staffId').put(updateClinicStaff).delete(deleteClinicStaff);

module.exports = router; 