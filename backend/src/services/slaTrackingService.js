const logger = require('../utils/logger');
// Assume a database model or repository exists for verification requests
// const VerificationRequest = require('../models/VerificationRequest');
const VerificationRequest = require('../models/VerificationRequest'); // Import the model

/**
 * @typedef {('Standard' | 'Expedited')} VerificationPriority
 */

/**
 * @typedef {('On Track' | 'At Risk' | 'Breached' | 'Completed' | 'N/A')} SLAStatus
 */

/**
 * @typedef {Object} SLAStatusResult
 * @property {SLAStatus} status - The current SLA status.
 * @property {number} timeElapsedHours - Time elapsed since creation in hours.
 * @property {number} slaGoalHours - The SLA goal in hours.
 * @property {number} timeRemainingHours - Time remaining until SLA breach (negative if breached).
 */

// Define SLA goals in hours
const SLA_GOALS = {
    Standard: 72, // 3 days
    Expedited: 24, // 1 day
};

// Define 'At Risk' threshold (e.g., when 80% of SLA time has passed)
const AT_RISK_THRESHOLD_PERCENT = 0.8;

/**
 * Service for tracking Service Level Agreements (SLAs) for verification requests.
 */
class SLATrackingService {

    /**
     * Gets the SLA goal in hours for a given priority level.
     * Assumes 'Standard' if priority is not provided or invalid.
     *
     * @param {VerificationPriority} [priority='Standard'] - The priority level ('Standard' or 'Expedited').
     * @returns {number} The SLA goal in hours.
     */
    getSLAGoal(priority = 'Standard') {
        return SLA_GOALS[priority] || SLA_GOALS.Standard;
    }

    /**
     * Calculates the current SLA status for a given verification request.
     * Does NOT modify the request object.
     *
     * @param {object} verificationRequest - The verification request object (or document).
     * @param {string|Date} verificationRequest.createdAt - Timestamp of when the request was created.
     * @param {string|Date} [verificationRequest.completedAt] - Timestamp of when the request was completed (optional).
     * @param {VerificationPriority} [verificationRequest.priority='Standard'] - The priority of the request.
     * @param {string} [verificationRequest.status] - Current status (e.g., 'Pending', 'Approved', 'Rejected').
     * @returns {SLAStatusResult}
     */
    calculateSLAStatus(verificationRequest) {
        // Destructure with defaults, using completedAt explicitly
        const { createdAt, completedAt, priority = 'Standard', status } = verificationRequest;

        if (!createdAt) {
            logger.warn('Cannot calculate SLA status without createdAt timestamp.', { id: verificationRequest._id });
            // Return N/A status and zeroed times
            return { status: 'N/A', timeElapsedHours: 0, slaGoalHours: this.getSLAGoal(priority), timeRemainingHours: this.getSLAGoal(priority) };
        }

        const slaGoalHours = this.getSLAGoal(priority);
        const now = new Date();
        const createdDate = new Date(createdAt);

        // If completedAt is explicitly set (meaning final state reached)
        if (completedAt) {
            const completionDate = new Date(completedAt);
            const timeElapsedMs = completionDate.getTime() - createdDate.getTime();
            const timeElapsedHours = timeElapsedMs / (1000 * 60 * 60);
            // Final status is 'Completed' if within goal, otherwise 'Breached'
            const finalStatus = timeElapsedHours <= slaGoalHours ? 'Completed' : 'Breached';

            return {
                status: finalStatus,
                timeElapsedHours: parseFloat(timeElapsedHours.toFixed(2)),
                slaGoalHours,
                // Time remaining is negative if breached, 0 if exactly met, positive otherwise (relative to goal)
                timeRemainingHours: parseFloat((slaGoalHours - timeElapsedHours).toFixed(2)),
            };
        }

        // Calculate status for ONGOING requests (no completedAt)
        const timeElapsedMs = now.getTime() - createdDate.getTime();
        const timeElapsedHours = timeElapsedMs / (1000 * 60 * 60);
        const timeRemainingHours = slaGoalHours - timeElapsedHours;
        const atRiskThresholdHours = slaGoalHours * AT_RISK_THRESHOLD_PERCENT;

        let currentStatus;
        if (timeElapsedHours > slaGoalHours) {
            currentStatus = 'Breached';
        } else if (timeElapsedHours >= atRiskThresholdHours) {
            currentStatus = 'At Risk';
        } else {
            currentStatus = 'On Track';
        }

        logger.debug(`SLA Status for ongoing request ${verificationRequest._id}: ${currentStatus}`, {
            elapsed: timeElapsedHours, goal: slaGoalHours, remaining: timeRemainingHours
        });

        return {
            status: currentStatus,
            timeElapsedHours: parseFloat(timeElapsedHours.toFixed(2)),
            slaGoalHours,
            timeRemainingHours: parseFloat(timeRemainingHours.toFixed(2)),
        };
    }

    /**
     * Calculates the final SLA status and processing time for a completed request,
     * updates the VerificationRequest document, and saves it.
     * Should be called ONLY when a request transitions to 'Approved' or 'Rejected'.
     *
     * @param {mongoose.Document} verificationRequestDoc - The Mongoose document for the verification request.
     * @returns {Promise<void>}
     */
    async updateSLAStatusAndDuration(verificationRequestDoc) {
        if (!verificationRequestDoc || !verificationRequestDoc.isModified('status')) {
             // Only proceed if the document exists and status has changed
             // Or if completedAt was just set (though status check is safer)
            logger.warn('updateSLAStatusAndDuration called without status change or missing doc.', { id: verificationRequestDoc?._id });
            return;
        }

        // Ensure completedAt is set when status becomes Approved/Rejected
        if (['Approved', 'Rejected'].includes(verificationRequestDoc.status) && !verificationRequestDoc.completedAt) {
            verificationRequestDoc.completedAt = new Date();
             logger.debug(`Setting completedAt for request ${verificationRequestDoc._id}`);
        } else if (!['Approved', 'Rejected'].includes(verificationRequestDoc.status)) {
            // Should not be called if status is not final, but log just in case
             logger.warn(`updateSLAStatusAndDuration called for non-final status: ${verificationRequestDoc.status}`, { id: verificationRequestDoc._id });
             return; // Don't update SLA for non-final statuses
        }

        // Calculate the final SLA status using the potentially just-set completedAt
        const { status: finalSlaStatus, timeElapsedHours } = this.calculateSLAStatus(verificationRequestDoc);

        verificationRequestDoc.slaStatus = finalSlaStatus;
        verificationRequestDoc.slaProcessingTimeHours = timeElapsedHours;

        try {
            await verificationRequestDoc.save();
            logger.info(`SLA status updated for verification request ${verificationRequestDoc._id}`, {
                finalStatus: verificationRequestDoc.status,
                slaStatus: finalSlaStatus,
                processingTime: timeElapsedHours
            });
        } catch (error) {
            logger.error(`Failed to save verification request ${verificationRequestDoc._id} after updating SLA status:`, error);
            // Consider how to handle save failures - retry? Log for manual fix?
            // Re-throwing might disrupt the original operation (approve/reject)
            // For now, just log the error.
        }
    }
}

module.exports = new SLATrackingService(); 