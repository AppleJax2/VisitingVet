const DocumentAccessLog = require('../models/DocumentAccessLog');
const logger = require('../utils/logger');

/**
 * Logs an attempt to access a document asynchronously.
 *
 * @param {string | object} adminUserId - The ID of the admin user accessing.
 * @param {string | object} targetUserId - The ID of the user whose document is accessed.
 * @param {string} documentKey - The unique key/identifier of the document.
 * @param {string} ipAddress - The IP address of the admin user.
 * @param {string} [documentType] - Optional: The type of document accessed.
 * @param {'VIEW' | 'DOWNLOAD'} [action='VIEW'] - The type of access.
 */
const logDocumentAccess = async (
    adminUserId, 
    targetUserId, 
    documentKey, 
    ipAddress, 
    documentType = null,
    action = 'VIEW' 
) => {
  try {
    // Run asynchronously
    DocumentAccessLog.create({
      adminUser: adminUserId,
      targetUser: targetUserId,
      documentKey,
      documentType,
      action,
      ipAddress,
    });
    logger.debug(`Document Access Logged: Admin ${adminUserId}, Target ${targetUserId}, Key ${documentKey}, Action ${action}`);
  } catch (error) {
    logger.error(`Failed to log document access for admin ${adminUserId}, key ${documentKey}:`, error);
  }
};

// Potential future functions for managing documents could go here
// e.g., an endpoint specifically for generating signed URLs which includes the logging

module.exports = {
  logDocumentAccess,
}; 