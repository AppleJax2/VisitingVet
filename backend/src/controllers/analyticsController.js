const AnalyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');
const { validationResult, query } = require('express-validator');
const RetentionAnalysisService = require('../services/retentionAnalysisService');

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

    /**
     * Handles the request for user retention analysis.
     * GET /api/admin/analytics/retention
     * Query params: cohortMonths?, periodsToTrack?
     */
    async handleGetUserRetention(req, res) {
        // Potentially add validation for query params if needed
        const errors = validationResult(req); // Reuse existing validation for dates if applicable
        if (!errors.isEmpty()) {
            logger.warn('Invalid input for user retention endpoint', { errors: errors.array() });
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
             // Use defaults or query params
             const cohortMonths = req.query.cohortMonths ? parseInt(req.query.cohortMonths) : 12;
             const periodsToTrack = req.query.periodsToTrack ? parseInt(req.query.periodsToTrack) : 6;
            
             logger.info(`Request received for user retention analysis`, { cohortMonths, periodsToTrack });
            
             // Use current date as analysis end date
            const retentionData = await RetentionAnalysisService.calculateMonthlyLoginRetention(
                 new Date(),
                 cohortMonths,
                 periodsToTrack
             );
            
            res.status(200).json(retentionData);

        } catch (error) {
            logger.error(`Error handling getUserRetention request: ${error.message}`, { error: error.stack });
            if (error.message.includes('Misconfiguration')) {
                res.status(500).json({ message: 'Internal server configuration error for retention analysis.' });
            } else {
                 res.status(500).json({ message: 'Internal server error while calculating user retention.' });
            }
        }
    }

    /**
     * Handles the request for user segmentation by role.
     * GET /api/admin/analytics/segmentation/role
     */
    async handleGetUserSegmentsByRole(req, res) {
        // No specific validation needed for this simple case
        try {
            logger.info(`Request received for user segmentation by role`);
            const segments = await AnalyticsService.getUserSegmentsByRole();
            res.status(200).json({ 
                results: segments, 
                criteria: 'role' 
            });
        } catch (error) {
            logger.error(`Error handling getUserSegmentsByRole request: ${error.message}`, { error: error.stack });
             if (error.message.includes('Misconfiguration')) {
                res.status(500).json({ message: 'Internal server configuration error for segmentation analysis.' });
            } else {
                 res.status(500).json({ message: 'Internal server error while calculating user segments.' });
            }
        }
    }
}

module.exports = {
    AnalyticsController: new AnalyticsController(),
    validateAnalyticsRequest // Export validation middleware
}; 