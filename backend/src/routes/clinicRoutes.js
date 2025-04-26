const express = require('express');
const {
  getClinicAppointments,
  getClinicStaff
} = require('../controllers/clinicController');
const { protect, restrictTo } = require('../middleware/authMiddleware'); // Assuming auth middleware exists

const router = express.Router();

// Apply authentication and role restriction (Clinic) to all clinic routes
router.use(protect, restrictTo('Clinic'));

router.route('/appointments').get(getClinicAppointments);
router.route('/staff').get(getClinicStaff);

// TODO: Add routes for managing staff, inventory, clinic profile, etc.
// Example: router.route('/staff').post(addClinicStaff);
// Example: router.route('/staff/:staffId').put(updateClinicStaff).delete(deleteClinicStaff);

module.exports = router; 