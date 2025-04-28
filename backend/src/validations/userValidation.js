/**
 * User validation utilities for the VisitingVet application
 * Includes validations for user data, especially password strength requirements
 */

/**
 * Validates password strength based on multiple criteria:
 * - Minimum length
 * - Contains uppercase
 * - Contains lowercase
 * - Contains numbers
 * - Contains special characters
 * 
 * @param {string} password - The password to validate
 * @param {Object} options - Customizable options for validation
 * @returns {Object} Validation result with status and any errors
 */
const validatePasswordStrength = (password, options = {}) => {
  // Default requirements
  const requirements = {
    minLength: options.minLength || 8,
    requireUppercase: options.requireUppercase !== false,
    requireLowercase: options.requireLowercase !== false,
    requireNumbers: options.requireNumbers !== false,
    requireSpecialChars: options.requireSpecialChars !== false
  };
  
  const errors = [];
  
  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }
  
  // Check for uppercase letters
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letters
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for numbers
  if (requirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special characters
  if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;\':"\\,.<>/?)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculates a password strength score (0-100)
 * Higher scores mean stronger passwords
 * 
 * @param {string} password - The password to evaluate
 * @returns {number} Score from 0-100
 */
const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Base score from length (up to 40 points)
  const lengthScore = Math.min(password.length * 4, 40);
  score += lengthScore;
  
  // Character variety (up to 60 points)
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  // Add points for each character type
  if (hasUppercase) score += 10;
  if (hasLowercase) score += 10;
  if (hasNumbers) score += 10;
  if (hasSpecialChars) score += 10;
  
  // Add points for mixed character types
  const typesCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  score += (typesCount - 1) * 5; // Up to 15 additional points for variety
  
  // Check for common patterns that weaken passwords
  const hasRepeatingChars = /(.)\1{2,}/.test(password); // e.g., 'aaa'
  const hasSequentialChars = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  const hasCommonWords = /(password|admin|user|login|welcome|qwerty|abc123)/i.test(password);
  
  // Deduct points for weak patterns
  if (hasRepeatingChars) score -= 10;
  if (hasSequentialChars) score -= 10;
  if (hasCommonWords) score -= 20;
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
};

/**
 * Gets a descriptive strength label based on password score
 * 
 * @param {number} score - Password strength score (0-100)
 * @returns {string} Descriptive label
 */
const getPasswordStrengthLabel = (score) => {
  if (score < 20) return 'Very Weak';
  if (score < 40) return 'Weak';
  if (score < 60) return 'Moderate';
  if (score < 80) return 'Strong';
  return 'Very Strong';
};

/**
 * Validates email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
const validateEmail = (email) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(String(email).toLowerCase());
};

/**
 * Validates a phone number (basic format check)
 * 
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} Whether phone number is valid
 */
const validatePhoneNumber = (phoneNumber) => {
  // Remove common formatting characters
  const stripped = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  
  // Check if it consists of 10-15 digits
  return /^\+?[0-9]{10,15}$/.test(stripped);
};

module.exports = {
  validatePasswordStrength,
  calculatePasswordStrength,
  getPasswordStrengthLabel,
  validateEmail,
  validatePhoneNumber
}; 