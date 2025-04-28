const logger = require('../utils/logger');
// Potentially import other services if needed for checks, e.g.:
// const CredentialValidationService = require('./credentialValidationService');

/**
 * @typedef {('low' | 'medium' | 'high')} RiskLevel
 */

/**
 * @typedef {Object} RiskScoreResult
 * @property {number} score - A numerical risk score (e.g., 0-100).
 * @property {RiskLevel} level - Categorical risk level.
 * @property {string[]} factors - List of factors contributing to the score.
 */

/**
 * Service for performing automated checks on verification requests
 * and calculating a risk score to help prioritize manual review.
 */
class VerificationScoringService {

    /**
     * Calculates a risk score for a given verification request.
     *
     * @param {object} verificationData - Data associated with the verification request.
     * @param {object} verificationData.providerInfo - Information about the provider (e.g., name, address).
     * @param {object} verificationData.documentInfo - Information about the submitted document (e.g., type, issue date).
     * @param {object} [verificationData.credentialStatus] - Result from CredentialValidationService (optional).
     * @returns {Promise<RiskScoreResult>} The calculated risk score and level.
     */
    async calculateRiskScore(verificationData) {
        const { providerInfo, documentInfo, credentialStatus } = verificationData;
        let score = 0;
        const factors = [];

        logger.info('Calculating risk score for verification request.', { verificationId: verificationData.id /* Assuming an ID exists */ });

        try {
            // --- Basic Checks --- //
            if (!providerInfo || !documentInfo) {
                logger.warn('Insufficient data for risk scoring.', { verificationId: verificationData.id });
                score += 50; // Assign high penalty if core data is missing
                factors.push('Missing core provider or document information.');
            } else {
                // --- Document Checks (Example) --- //
                if (!this._isDocumentTypeRecognized(documentInfo.type)) {
                    score += 15;
                    factors.push(`Unrecognized document type: ${documentInfo.type}`);
                }
                if (this._isDocumentExpired(documentInfo.expiryDate)) {
                    score += 25;
                    factors.push('Document appears to be expired.');
                }

                // --- Provider Info Checks (Example) --- //
                if (!this._isAddressComplete(providerInfo.address)) {
                    score += 10;
                    factors.push('Provider address seems incomplete.');
                }

                // --- Cross-referencing / Credential Status Check (Example) --- //
                if (credentialStatus) {
                    switch (credentialStatus.status) {
                        case 'invalid':
                            score += 40;
                            factors.push('Credential validation returned invalid.');
                            break;
                        case 'error':
                            score += 20;
                            factors.push('Error occurred during credential validation.');
                            break;
                        case 'pending':
                            score += 10;
                            factors.push('Credential validation is still pending.');
                            break;
                        // 'valid' status doesn't add risk points
                    }
                }
                 else {
                    // If credential status is not available yet, might add some risk
                    score += 5;
                    factors.push('Credential validation status not available for scoring.');
                }

                // Add more complex checks here: consistency checks, pattern recognition, etc.
            }

            // Clamp score between 0 and 100
            score = Math.max(0, Math.min(100, score));

            const level = this._determineRiskLevel(score);

            logger.info(`Risk score calculated for verification request ${verificationData.id}: ${score} (${level})`, { factors });

            return {
                score,
                level,
                factors,
            };

        } catch (error) {
            logger.error(`Error calculating risk score for verification ${verificationData.id}: ${error.message}`, {
                error: error.stack,
                verificationData,
            });
            // Return a high-risk score in case of calculation errors
            return {
                score: 90, // Indicate high risk due to error
                level: 'high',
                factors: ['Error occurred during risk score calculation.'],
            };
        }
    }

    /** @private */
    _isDocumentTypeRecognized(docType) {
        const recognizedTypes = ['VETERINARY_LICENSE', 'BUSINESS_LICENSE', 'DEA_REGISTRATION']; // Example list
        return recognizedTypes.includes(docType?.toUpperCase());
    }

    /** @private */
    _isDocumentExpired(expiryDate) {
        if (!expiryDate) return false; // Cannot determine if no expiry date
        try {
            return new Date(expiryDate) < new Date();
        } catch { return false; /* Invalid date format */ }
    }

    /** @private */
    _isAddressComplete(address) {
        // Very basic check - could be improved significantly (e.g., using address validation library)
        if (!address) return false;
        return address.street && address.city && address.state && address.zipCode;
    }

    /** @private */
    _determineRiskLevel(score) {
        if (score >= 60) {
            return 'high';
        }
        if (score >= 30) {
            return 'medium';
        }
        return 'low';
    }
}

module.exports = new VerificationScoringService(); 