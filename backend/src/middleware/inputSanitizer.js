const { body, query, param } = require('express-validator');

// Generic sanitization middleware to apply to all admin inputs
const sanitizeInputs = [
  // Sanitize body fields
  body().trim().escape(),

  // Sanitize query parameters
  query().trim().escape(),

  // Sanitize URL parameters
  param().trim().escape(),

  // You might want more specific sanitizers depending on expected data types
  // e.g., body('*.email').normalizeEmail()
  // e.g., body('*.numericField').toInt()

  (req, res, next) => {
    // The sanitization happens automatically by express-validator
    // based on the chains above. We just need to call next().
    next();
  }
];

module.exports = sanitizeInputs; 