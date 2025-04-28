const express = require('express');
const { AnalyticsController, validateAnalyticsRequest } = require('../controllers/analyticsController');
const { authenticateAdmin } = require('../middleware/authMiddleware'); // Assuming admin auth middleware
const { query } = require('express-validator'); // For input validation

const router = express.Router();

// Apply admin authentication and request validation to all analytics routes
router.use(authenticateAdmin);

// Validation rules for date range queries
const dateRangeValidationRules = [
    query('startDate').optional().isISO8601().toDate().withMessage('startDate must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().toDate().withMessage('endDate must be a valid ISO 8601 date'),
];

// GET /api/admin/analytics/user-growth
router.get(
    '/user-growth',
    dateRangeValidationRules,
    validateAnalyticsRequest,
    AnalyticsController.handleGetUserGrowthMetrics
);

// GET /api/admin/analytics/verification-rate
router.get(
    '/verification-rate',
    dateRangeValidationRules,
    validateAnalyticsRequest,
    AnalyticsController.handleGetVerificationRateMetrics // Placeholder handler
);

// GET /api/admin/analytics/service-usage
router.get(
    '/service-usage',
    dateRangeValidationRules,
    validateAnalyticsRequest,
    AnalyticsController.handleGetServiceUsageMetrics // Placeholder handler
);

// GET /api/admin/analytics/retention
router.get(
    '/retention',
    AnalyticsController.handleGetUserRetention
);

// GET /api/admin/analytics/segmentation/role
router.get(
    '/segmentation/role',
    AnalyticsController.handleGetUserSegmentsByRole
);

// Add other analytics routes here...

module.exports = router; 