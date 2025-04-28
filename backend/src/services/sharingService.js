const crypto = require('crypto'); // For generating secure tokens
const ApiError = require('../errors/ApiError');
// const { VaccinationRecord, VerificationStatus } = require('../models/VaccinationRecord');
// const SharedCertificateLink = require('../models/SharedCertificateLink'); // Need a model to store tokens/expiry

/**
 * Generates a secure, time-limited sharing link for a verified vaccination certificate.
 * 
 * @param {string} recordId - The ID of the VaccinationRecord to share.
 * @param {string} userId - The ID of the user initiating the share (owner).
 * @param {number} [expiresInHours=24] - How many hours the link should be valid for.
 * @returns {Promise<string>} - The generated secure sharing URL.
 * @throws {ApiError} - If record not found, not verified, or generation fails.
 */
const generateShareLink = async (recordId, userId, expiresInHours = 24) => {
    console.log(`[Sharing Service] Request to generate share link for Record ID: ${recordId} by User ID: ${userId}`);
    
    try {
        // 1. Validate the record exists and is verified
        // const record = await VaccinationRecord.findById(recordId).select('verificationStatus owner');
        // if (!record) {
        //     throw ApiError.notFound('Vaccination record not found.');
        // }
        // if (record.verificationStatus !== VerificationStatus.VERIFIED) {
        //     throw ApiError.badRequest('Cannot share an unverified vaccination record.');
        // }
        // if (String(record.owner) !== userId) {
        //     throw ApiError.forbidden('Only the pet owner can share this record.');
        // }
        console.log(`[Sharing Service] Record ${recordId} validated for sharing.`); // Simulation

        // 2. Generate a secure, unique token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

        // 3. Store the token, recordId, userId, and expiry in a database table/collection
        //    (e.g., SharedCertificateLink model)
        // const newLink = new SharedCertificateLink({ 
        //     token,
        //     record: recordId,
        //     sharedBy: userId,
        //     expiresAt,
        // });
        // await newLink.save();
        console.log(`[Sharing Service] Simulated storing share token: ${token}, Expires: ${expiresAt.toISOString()}`);

        // 4. Construct the URL (Base URL should come from config)
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Example base URL
        const shareUrl = `${baseUrl}/share/certificate/${token}`;

        console.log(`[Sharing Service] Generated share URL: ${shareUrl}`);
        await new Promise(resolve => setTimeout(resolve, 40)); // Simulate async
        return shareUrl;

    } catch (error) {
        console.error(`[Sharing Service] Failed to generate share link for record ${recordId}:`, error);
        throw error instanceof ApiError ? error : ApiError.internal('Failed to generate share link.', error);
    }
};

/**
 * Verifies a sharing token and retrieves the associated record ID.
 * 
 * @param {string} token - The sharing token from the URL.
 * @returns {Promise<{recordId: string, isValid: boolean, reason?: string}>} 
 *          - recordId: The ID of the associated VaccinationRecord if valid.
 *          - isValid: Boolean indicating if the token is valid and not expired.
 *          - reason: Explanation if invalid (e.g., 'Token expired', 'Token not found').
 * @throws {ApiError} - If verification lookup fails.
 */
const verifyShareToken = async (token) => {
    console.log(`[Sharing Service] Verifying share token: ${token}`);
    try {
        // 1. Find the token in the database
        // const linkData = await SharedCertificateLink.findOne({ token: token });
        
        // Simulate DB lookup
        await new Promise(resolve => setTimeout(resolve, 30));
        const simulatedLinkData = { // Simulate finding a valid token
            token: token,
            record: 'simulatedRecordIdForToken_' + token.substring(0, 5),
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // Expires in 1 hour
        };
        // const simulatedExpiredLinkData = { token: token, record: 'recExpired', expiresAt: new Date(Date.now() - 1000) };
        // const simulatedNotFound = null;

        const linkData = simulatedLinkData; // Change this to test other scenarios

        if (!linkData) {
            console.log('[Sharing Service] Token not found.');
            return { recordId: null, isValid: false, reason: 'Token not found' };
        }

        // 2. Check if expired
        if (new Date() > linkData.expiresAt) {
            console.log(`[Sharing Service] Token expired at ${linkData.expiresAt.toISOString()}.`);
            // Optional: Clean up expired tokens from DB periodically or here
            // await SharedCertificateLink.deleteOne({ _id: linkData._id });
            return { recordId: null, isValid: false, reason: 'Token expired' };
        }

        // 3. Token is valid
        console.log(`[Sharing Service] Token verified successfully for Record ID: ${linkData.record}`);
        return { recordId: linkData.record, isValid: true };

    } catch (error) {
        console.error(`[Sharing Service] Error verifying share token ${token}:`, error);
        throw ApiError.internal('Failed to verify share token.', error);
    }
};

module.exports = {
    generateShareLink,
    verifyShareToken,
}; 