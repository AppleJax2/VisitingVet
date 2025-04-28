const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes that require authentication
router.use(protect);

// Create a service request (clinic only)
router.post(
  '/',
  authorize('clinic'),
  serviceRequestController.createServiceRequest
);

// Get all service requests for the logged-in user
router.get(
  '/',
  authorize('clinic', 'provider', 'pet_owner', 'admin'),
  serviceRequestController.getUserServiceRequests
);

// Get a single service request by ID
router.get(
  '/:id',
  authorize('clinic', 'provider', 'pet_owner', 'admin'),
  serviceRequestController.getServiceRequestById
);

// Provider responds to a service request
router.put(
  '/:id/provider-response',
  authorize('provider'),
  serviceRequestController.providerResponse
);

// Pet owner selects a time slot
router.put(
  '/:id/pet-owner-response',
  authorize('pet_owner'),
  serviceRequestController.petOwnerResponse
);

// Update service request status (any party)
router.put(
  '/:id/status',
  authorize('clinic', 'provider', 'pet_owner', 'admin'),
  serviceRequestController.updateServiceRequestStatus
);

// Add attachment to service request
router.post(
  '/:id/attachments',
  authorize('clinic', 'provider', 'pet_owner', 'admin'),
  serviceRequestController.addAttachment
);

// Get statistics on service requests (admin only)
router.get(
  '/stats/overview',
  authorize('admin'),
  serviceRequestController.getServiceRequestStats
);

module.exports = router; 