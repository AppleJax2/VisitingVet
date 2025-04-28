const ServiceUsageLog = require('../models/ServiceUsageLog');
const logger = require('../utils/logger');

class UsageTrackingService {
    /**
     * Logs a service usage event.
     * Avoids throwing errors to prevent disruption of the calling process.
     *
     * @param {string} eventType - The type of event (must match enum in ServiceUsageLog model).
     * @param {string|null} userId - The ID of the user associated with the event, or null.
     * @param {object} details - An object containing event-specific details.
     * @returns {Promise<void>}
     */
    async logUsage(eventType, userId, details = {}) {
        try {
            // Basic validation
            if (!eventType) {
                logger.warn('UsageTrackingService.logUsage called without eventType.');
                return;
            }

            // Validate if eventType is in the schema enum (optional, but good practice)
            // const validEventTypes = ServiceUsageLog.schema.path('eventType').enumValues;
            // if (!validEventTypes.includes(eventType)) {
            //     logger.warn(`UsageTrackingService.logUsage called with invalid eventType: ${eventType}`);
            //     // Decide whether to log as 'OTHER' or skip
            //     // eventType = 'OTHER'; // Or return
            // }

            const logEntry = new ServiceUsageLog({
                eventType,
                userId: userId || null,
                details,
                timestamp: new Date() // Ensure timestamp is set now
            });

            await logEntry.save();
            logger.debug(`Service usage logged: ${eventType}`, { userId, details });

        } catch (error) {
            logger.error(`Failed to log service usage event (${eventType}):`, {
                 error: error.message,
                 userId,
                 details
             });
            // Do not re-throw, as logging failure should ideally not break functionality.
        }
    }

     /**
     * Middleware function to log API calls.
     * Calculates request duration.
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    logApiCallMiddleware = (req, res, next) => {
        const start = process.hrtime();

        // Use 'finish' event to capture status code and duration after response is sent
        res.on('finish', async () => {
            const diff = process.hrtime(start);
            const durationMs = (diff[0] * 1e3) + (diff[1] * 1e-6);

            const eventType = 'API_CALL';
            const userId = req.user ? req.user.id : null; // Assumes auth middleware adds req.user
            const details = {
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
                ip: req.ip || req.connection?.remoteAddress,
                userAgent: req.get('User-Agent'),
                durationMs: parseFloat(durationMs.toFixed(2))
            };

            // Log asynchronously without awaiting to avoid delaying anything
            this.logUsage(eventType, userId, details);
        });

        next(); // Proceed to the next middleware/handler
    };
}

module.exports = new UsageTrackingService(); 