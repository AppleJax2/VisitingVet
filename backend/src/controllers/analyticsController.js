const AnalyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');
const { validationResult, query } = require('express-validator');

// Validation middleware for analytics endpoints
const validateAnalyticsRequest = [
    query('startDate').optional().isISO8601().toDate().withMessage('Invalid start date format, use YYYY-MM-DD or ISO8601'),
    query('endDate').optional().isISO8601().toDate().withMessage('Invalid end date format, use YYYY-MM-DD or ISO8601'),
    query('comparisonPeriod').optional().isIn(['day', 'week', 'month', 'year', 'total']).withMessage('Invalid comparison period')
];

/**
 * Controller for handling analytics-related API requests.
 */
class AnalyticsController {

    /**
     * Handles the request for user growth metrics.
     * GET /api/admin/analytics/user-growth
     * Query params: startDate?, endDate?, comparisonPeriod? ('day', 'week', 'month', 'year', 'total')
     */
    async handleGetUserGrowthMetrics(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Invalid input for user growth metrics', { errors: errors.array() });
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const endDate = req.query.endDate || new Date();
            const startDate = req.query.startDate || new Date(new Date().setDate(endDate.getDate() - 30));
            const comparisonPeriod = req.query.comparisonPeriod || 'total'; // Default to total

            if (startDate >= endDate) {
                 logger.warn('Invalid date range for user growth', { startDate, endDate });
                return res.status(400).json({ message: 'Start date must be before end date.' });
            }

            logger.info(`Request for user growth metrics`, { startDate: startDate.toISOString(), endDate: endDate.toISOString(), comparisonPeriod });
            const metrics = await AnalyticsService.getUserGrowthMetrics(startDate, endDate, comparisonPeriod);
            res.status(200).json(metrics);

        } catch (error) {
            logger.error(`Error handling getUserGrowthMetrics: ${error.message}`, { error: error.stack });
            res.status(500).json({ message: 'Internal server error fetching user growth metrics.' });
        }
    }

    /**
     * Handles the request for verification rate metrics.
     * GET /api/admin/analytics/verification-metrics
     * Query params: startDate?, endDate?, comparisonPeriod? ('day', 'week', 'month', 'year', 'total')
     */
    async handleGetVerificationRateMetrics(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Invalid input for verification rate metrics', { errors: errors.array() });
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const endDate = req.query.endDate || new Date();
            const startDate = req.query.startDate || new Date(new Date().setDate(endDate.getDate() - 30));
            const comparisonPeriod = req.query.comparisonPeriod || 'total';
            
            if (startDate >= endDate) {
                logger.warn('Invalid date range for verification rate', { startDate, endDate });
                return res.status(400).json({ message: 'Start date must be before end date.' });
            }

            logger.info(`Request for verification rate metrics`, { startDate: startDate.toISOString(), endDate: endDate.toISOString(), comparisonPeriod });
            const metrics = await AnalyticsService.getVerificationRateMetrics(startDate, endDate, comparisonPeriod);
            res.status(200).json(metrics);

        } catch (error) {
            logger.error(`Error handling getVerificationRateMetrics: ${error.message}`, { error: error.stack });
            if (error.message.includes('Invalid comparison period')) {
                 return res.status(400).json({ message: error.message });
            }
            if (error.message.includes('Misconfiguration')) {
                res.status(500).json({ message: 'Internal server configuration error.' });
            } else if (error.message.includes('database') || error.message.includes('aggregation')) {
                 res.status(500).json({ message: 'Internal server error processing verification metrics.' });
            } else {
                res.status(500).json({ message: 'Internal server error fetching verification rate metrics.' });
            }
        }
    }

    /**
     * Handles the request for service usage metrics.
     * GET /api/admin/analytics/service-usage
     * Query params: startDate?, endDate?, comparisonPeriod? ('day', 'week', 'month', 'year', 'total')
     */
     async handleGetServiceUsageMetrics(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('Invalid input for service usage metrics', { errors: errors.array() });
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const endDate = req.query.endDate || new Date();
            const startDate = req.query.startDate || new Date(new Date().setDate(endDate.getDate() - 30));
            const comparisonPeriod = req.query.comparisonPeriod || 'total';

            if (startDate >= endDate) {
                logger.warn('Invalid date range for service usage', { startDate, endDate });
                return res.status(400).json({ message: 'Start date must be before end date.' });
            }

            logger.info(`Request for service usage metrics`, { startDate: startDate.toISOString(), endDate: endDate.toISOString(), comparisonPeriod });
            // Note: Service needs implementation for comparisonPeriod aggregation
            const metrics = await AnalyticsService.getServiceUsageMetrics(startDate, endDate, comparisonPeriod);
            res.status(200).json(metrics);

        } catch (error) {
            logger.error(`Error handling getServiceUsageMetrics: ${error.message}`, { error: error.stack });
             if (error.message.includes('Invalid comparison period')) {
                 return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Internal server error fetching service usage metrics.' });
        }
    }
}

module.exports = {
    AnalyticsController: new AnalyticsController(),
    validateAnalyticsRequest // Export validation middleware
}; 