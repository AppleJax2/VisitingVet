const express = require('express');
const AnalyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming admin auth middleware
const { query } = require('express-validator'); // For input validation

const router = express.Router();

// Validation rules for date range queries
const dateRangeValidationRules = [
    query('startDate').optional().isISO8601().toDate().withMessage('startDate must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().toDate().withMessage('endDate must be a valid ISO 8601 date'),
];

// Mount admin-only routes under /admin/analytics

// GET /api/admin/analytics/user-growth
router.get(
    '/user-growth',
    authMiddleware.isAdmin, // Ensure only admins can access
    dateRangeValidationRules,
    AnalyticsController.handleGetUserGrowthMetrics
);

// GET /api/admin/analytics/verification-rate
router.get(
    '/verification-rate',
    authMiddleware.isAdmin,
    dateRangeValidationRules,
    AnalyticsController.handleGetVerificationRateMetrics // Placeholder handler
);

// GET /api/admin/analytics/service-usage
router.get(
    '/service-usage',
    authMiddleware.isAdmin,
    dateRangeValidationRules,
    AnalyticsController.handleGetServiceUsageMetrics // Placeholder handler
);

// Add other analytics routes here...

module.exports = router; 