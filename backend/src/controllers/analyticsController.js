const AnalyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * Controller for handling analytics-related API requests.
 */
class AnalyticsController {

    /**
     * Handles the request for user growth metrics.
     * GET /api/admin/analytics/user-growth
     * Query params: startDate (ISO 8601), endDate (ISO 8601)
     */
    async handleGetUserGrowthMetrics(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Invalid input for user growth metrics endpoint', { errors: errors.array() });
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Default to last 30 days if dates are not provided
            const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
            const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setDate(endDate.getDate() - 30));

            // Basic validation: Ensure dates are valid and startDate is before endDate
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
                 logger.warn('Invalid date range provided for user growth metrics', { startDate: req.query.startDate, endDate: req.query.endDate });
                return res.status(400).json({ message: 'Invalid date range. Ensure startDate is before endDate and dates are valid ISO 8601 format.' });
            }

            logger.info(`Request received for user growth metrics: ${startDate.toISOString()} to ${endDate.toISOString()}`);
            const metrics = await AnalyticsService.getUserGrowthMetrics(startDate, endDate);
            res.status(200).json(metrics);

        } catch (error) {
            logger.error(`Error handling getUserGrowthMetrics request: ${error.message}`, { error: error.stack });
            res.status(500).json({ message: 'Internal server error while fetching user growth metrics.' });
        }
    }

    // Add handlers for other analytics endpoints (verification, service usage, etc.) here
    async handleGetVerificationRateMetrics(req, res) {
        // Implementation for verification rate metrics
        res.status(501).json({ message: 'Verification rate metrics endpoint not implemented yet.'});
    }

     async handleGetServiceUsageMetrics(req, res) {
        // Implementation for service usage metrics
        res.status(501).json({ message: 'Service usage metrics endpoint not implemented yet.'});
    }
}

module.exports = new AnalyticsController(); 