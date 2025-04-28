// Basic configuration
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Default if not set in .env
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '', // Get from .env
};

if (!config.stripePublishableKey) {
  console.warn('Stripe Publishable Key is not set. Payment features will not work.');
  // Optionally, provide a default test key for development, but warn loudly.
  // config.stripePublishableKey = 'pk_test_YOUR_DEFAULT_TEST_KEY'; 
}

export default config; 