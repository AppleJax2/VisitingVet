const { validationResult, body, param } = require('express-validator');

// Validation middleware
const validateManualVerification = [
    param('providerId').isMongoId().withMessage('Invalid provider ID format.'),
    body('doraVerificationStatus').isIn(['Not Verified', 'Verified - Valid', 'Verified - Expired', 'Verified - Other Issue', 'Verification Pending']).withMessage('Invalid verification status.'),
    body('doraVerificationDate').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Invalid verification date format.')
];

class ProviderController {
    // ... other controller methods (getProvider, updateProviderProfile, etc.)

    /**
     * Updates the manual DORA verification status for a provider.
     * PUT /api/admin/providers/:providerId/manual-verification
     * Body: { doraVerificationStatus: string, doraVerificationDate?: string (ISO8601) }
     */
    async updateManualDoraVerification(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Invalid input for updating manual verification', { errors: errors.array(), providerId: req.params.providerId });
            return res.status(400).json({ errors: errors.array() });
        }

        const { providerId } = req.params;
        const { doraVerificationStatus, doraVerificationDate } = req.body;
        const adminUserId = req.user.id; // Assuming admin user ID is available from auth middleware

        try {
            const provider = await Provider.findById(providerId);
            if (!provider) {
                logger.warn('Provider not found for manual verification update', { providerId });
                return res.status(404).json({ message: 'Provider not found.' });
            }

            // Update provider record
            provider.doraVerification = {
                status: doraVerificationStatus,
                lastChecked: doraVerificationDate ? new Date(doraVerificationDate) : new Date(), // Default to now if date not provided
                verifiedByAdminId: adminUserId,
                source: 'Manual DORA Check' // Indicate source
            };
            
            // Add to history log if applicable
            // provider.verificationHistory.push({ ... });

            await provider.save();
            
            logger.info('Manual DORA verification status updated successfully', { providerId, status: doraVerificationStatus, adminUserId });
            res.status(200).json(provider.doraVerification); // Return updated verification info

        } catch (error) {
            logger.error(`Error updating manual DORA verification for provider ${providerId}:`, error);
            res.status(500).json({ message: 'Internal server error while updating verification status.' });
        }
    }
}

module.exports = {
    ProviderController: new ProviderController(), // Assuming instantiation pattern
    validateManualVerification
}; 