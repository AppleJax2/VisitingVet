const UserActivityLog = require('../models/UserActivityLog');
const logger = require('../utils/logger'); // Basic logging

/**
 * Logs a user activity asynchronously.
 * Does not block the main request flow.
 * Handles potential logging errors internally.
 *
 * @param {string | object} userId - The ID of the user performing the action.
 * @param {string} ipAddress - The IP address of the user (if available).
 * @param {string} action - A constant representing the action (e.g., 'LOGIN_SUCCESS').
 * @param {'SUCCESS' | 'FAILURE'} status - The outcome of the action.
 * @param {object} [details={}] - Optional context about the action.
 * @param {string} [errorMessage=''] - Optional error message if status is 'FAILURE'.
 */
const logUserActivity = async (userId, ipAddress, action, status, details = {}, errorMessage = '') => {
  try {
    // Validate that userId is provided
    if (!userId) {
      logger.warn(`Attempted to log user activity without userId. Action: ${action}, Status: ${status}`);
      return; // Skip logging if userId is not provided
    }

    // Don't await this, let it run in the background
    UserActivityLog.create({
      user: userId,
      ipAddress,
      action,
      status,
      details,
      errorMessage: status === 'FAILURE' ? errorMessage : undefined,
    }).catch(err => {
      logger.error(`Failed to create UserActivityLog entry: ${err.message}`, {
        userId,
        action,
        status
      });
    });
    
    // Optionally log to console as well for immediate visibility during dev
    // logger.info(`Activity Logged: User ${userId}, Action: ${action}, Status: ${status}`);
  } catch (error) {
    logger.error(`Failed to log user activity for user ${userId}, action ${action}:`, error);
    // Decide if critical failures here should trigger alerts
  }
};

// Example Admin API Endpoint (to be implemented later or in adminController)
// const getActivityLogs = async (req, res) => { ... };

module.exports = {
  logUserActivity,
  // getActivityLogs, // Export if/when implemented
}; 