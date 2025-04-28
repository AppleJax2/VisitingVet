const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes that require authentication
router.use(protect);

// Create a service request (clinic only)
router.post(
  '/',
  authorize('Clinic'), // Use correct role name
  serviceRequestController.createServiceRequest
);

// Get all service requests for the logged-in user
router.get(
  '/',
  authorize('Clinic', 'MVSProvider', 'PetOwner', 'Admin'), // Use correct role names
  serviceRequestController.getUserServiceRequests
);

// Get a single service request by ID
router.get(
  '/:id',
  authorize('Clinic', 'MVSProvider', 'PetOwner', 'Admin'), // Use correct role names
  serviceRequestController.getServiceRequestById
);

// Provider responds to a service request
router.put(
  '/:id/provider-response',
  authorize('MVSProvider'), // Use correct role name
  serviceRequestController.providerResponse
);

// Pet owner selects a time slot
router.put(
  '/:id/pet-owner-response',
  authorize('PetOwner'), // Use correct role name
  serviceRequestController.petOwnerResponse
);

// Update service request status (any party)
router.put(
  '/:id/status',
  authorize('Clinic', 'MVSProvider', 'PetOwner', 'Admin'), // Use correct role names
  serviceRequestController.updateServiceRequestStatus
);

// Add attachment to service request
router.post(
  '/:id/attachments',
  authorize('Clinic', 'MVSProvider', 'PetOwner', 'Admin'), // Use correct role names
  serviceRequestController.addAttachment
);

// Get statistics on service requests (admin only)
router.get(
  '/stats/overview',
  authorize('Admin'), // Use correct role name
  serviceRequestController.getServiceRequestStats
);

module.exports = router; 