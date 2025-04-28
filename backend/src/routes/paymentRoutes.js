const express = require('express');
const {
  createPaymentIntent,
  handleStripeWebhook,
  createConnectAccountLink,
  getStripeAccount,
  getPetOwnerPaymentHistory,
  getProviderPaymentHistory,
  getAdminPaymentHistory,
} = require('../controllers/paymentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants'); // Assuming roles are defined here

// Route to create a payment intent - requires user to be logged in (PetOwner typically)
// We might adjust authorization based on who can initiate payment (e.g., PetOwner or Clinic)
router.post('/create-intent', protect, authorize(ROLES.PetOwner, ROLES.Clinic), createPaymentIntent);

// Route for provider to get their Stripe Account status/details
router.get('/stripe-account', protect, authorize(ROLES.MVSProvider), getStripeAccount);

// Route for provider to create/get a Stripe Connect onboarding link
router.post('/create-connect-account-link', protect, authorize(ROLES.MVSProvider), createConnectAccountLink);

// Stripe Webhook endpoint - Public, but signature is verified in controller
// Needs raw body parser middleware applied *before* this route
const webhookHandler = router.stack.find(layer => layer.route && layer.route.path === '/webhook' && layer.route.methods.post);
if (!webhookHandler) {
  // Define the handler logic here so it can be found by server.js
  router.post('/webhook', handleStripeWebhook);
}

// --- Payment History --- 
router.get('/my-history', protect, authorize(ROLES.PetOwner), getPetOwnerPaymentHistory);
router.get('/provider-history', protect, authorize(ROLES.MVSProvider), getProviderPaymentHistory);
router.get('/admin-history', protect, authorize(ROLES.Admin), getAdminPaymentHistory);

// Note: Refund initiation and advanced history filtering handled by TODOs in paymentController.js

module.exports = router; 