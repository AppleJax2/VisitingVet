const Stripe = require('stripe');
const config = require('../config/config');

// Initialize Stripe with the secret key from configuration
const stripe = new Stripe(config.stripe.secretKey);

module.exports = stripe; 