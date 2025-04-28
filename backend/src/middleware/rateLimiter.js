const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger'); // Assuming logger utility

// General rate limiter for most admin API routes
const adminApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip || req.connection.remoteAddress} on route: ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Example: Stricter limiter for sensitive actions (if needed later)
// const sensitiveActionLimiter = rateLimit({
//   windowMs: 5 * 60 * 1000, // 5 minutes
//   max: 10, 
//   message: 'Too many attempts for this action, please try again later',
//   // ... other options
// });

module.exports = {
  adminApiLimiter,
  // sensitiveActionLimiter // Export others if created
}; 