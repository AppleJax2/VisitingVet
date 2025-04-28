const Stripe = require('stripe');
const config = require('../config/config');

let stripe;

// Initialize Stripe with the secret key from configuration
if (config.stripe.secretKey) {
  stripe = new Stripe(config.stripe.secretKey);
} else {
  // Create a mock Stripe instance for development/testing
  console.warn('⚠️ No Stripe API key provided. Payment features will not work correctly.');
  
  // Use a dummy key for development that won't make real API calls
  stripe = new Stripe('sk_test_dummy_key_for_development');
  
  // Override methods to prevent real API calls in development
  const originalMethod = stripe.paymentIntents.create;
  stripe.paymentIntents.create = async function(...args) {
    console.log('Mock Stripe paymentIntents.create called with:', args);
    return { 
      id: 'mock_payment_intent_' + Date.now(),
      client_secret: 'mock_secret_' + Date.now(),
      status: 'succeeded'
    };
  };
  
  // Add other method overrides as needed
}

module.exports = stripe; 