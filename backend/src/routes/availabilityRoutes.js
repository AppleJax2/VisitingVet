const express = require('express');
const {
  getMyAvailability,
  updateAvailability,
  getProviderAvailability
} = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Private routes for provider to manage their own availability
router.route('/me')
  .get(protect, authorize('MVSProvider'), getMyAvailability)  // Get provider's own availability
  .post(protect, authorize('MVSProvider'), updateAvailability);  // Update provider's availability

// Public route to get a provider's availability (for appointment scheduling)
router.get('/:profileId', getProviderAvailability);

module.exports = router; 