/**
 * Utility functions for password validation and strength calculation
 */

/**
 * Validates password strength based on multiple criteria
 * @param {string} password - The password to validate
 * @returns {Object} Object containing validation result and errors
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  
  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculates password strength score on a scale of 0-100
 * @param {string} password - The password to evaluate
 * @returns {number} Score between 0-100
 */
export const calculatePasswordStrength = (password) => {
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
 * Returns a descriptive label for password strength based on score
 * @param {number} score - Password strength score (0-100)
 * @returns {string} Descriptive label
 */
export const getPasswordStrengthLabel = (score) => {
  if (score < 20) return 'Very Weak';
  if (score < 40) return 'Weak';
  if (score < 60) return 'Moderate';
  if (score < 80) return 'Strong';
  return 'Very Strong';
};

/**
 * Returns color for password strength meter based on score
 * @param {number} score - Password strength score (0-100)
 * @returns {string} CSS color value
 */
export const getPasswordStrengthColor = (score) => {
  if (score < 20) return '#dc3545'; // red
  if (score < 40) return '#ff8800'; // orange
  if (score < 60) return '#ffc107'; // yellow
  if (score < 80) return '#28a745'; // green
  return '#20c997'; // teal
}; 