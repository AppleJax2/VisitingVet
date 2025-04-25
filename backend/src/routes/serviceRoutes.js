const express = require('express');
const {
  createService,
  updateService,
  deleteService,
  getServicesByProfile,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes for managing services for a visiting vet profile
router.post(
  '/visiting-vet/services',
  protect,
  authorize('MVSProvider'),
  createService
);

router.route('/visiting-vet/services/:serviceId')
  .put(protect, authorize('MVSProvider'), updateService)
  .delete(protect, authorize('MVSProvider'), deleteService);

router.get('/visiting-vet/:profileId/services', getServicesByProfile);

module.exports = router; 