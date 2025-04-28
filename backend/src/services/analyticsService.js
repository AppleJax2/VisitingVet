const logger = require('../utils/logger');
// Assume necessary repositories or models are imported
// const UserRepository = require('../repositories/userRepository');
const VerificationRepository = require('../repositories/verificationRepository'); // Uncommented
// const AppointmentRepository = require('../repositories/appointmentRepository');
const ServiceUsageLog = require('../models/ServiceUsageLog'); // Import the usage log model
const mongoose = require('mongoose'); // Needed for aggregation pipeline
const { getDateFormatForAggregation } = require('../utils/aggregationHelpers'); // Assuming a helper exists
const User = require('../models/User'); // Added for User model

/**
 * Service responsible for calculating and aggregating various
 * platform analytics and metrics.
 */
class AnalyticsService {

    constructor() {
        // Initialize repositories or necessary dependencies
        // this.userRepository = UserRepository;
        // this.verificationRepository = VerificationRepository;
        // this.appointmentRepository = AppointmentRepository;
        logger.info('AnalyticsService initialized');
    }

    /**
     * Calculates user growth metrics, potentially grouped by a comparison period.
     *
     * @param {Date} startDate - The start date for the reporting period.
     * @param {Date} endDate - The end date for the reporting period.
     * @param {string} [comparisonPeriod='total'] - Grouping period ('day', 'week', 'month', 'year', or 'total').
     * @returns {Promise<object|Array>} Metrics object (for 'total') or array of metric objects (for other periods).
     */
    async getUserGrowthMetrics(startDate, endDate, comparisonPeriod = 'total') {
        logger.info('Calculating user growth metrics', { startDate, endDate, comparisonPeriod });
        try {
            const dateField = 'createdAt'; // Field indicating user creation

            // --- Total calculation (simplified, may need repository) ---
            if (comparisonPeriod === 'total') {
                 // Query the user database/repository for counts
                 const newUsers = await User.countDocuments({
                     [dateField]: { $gte: startDate, $lte: endDate }
                 });
                 // Total users up to the end date
                 const totalUsers = await User.countDocuments({ [dateField]: { $lte: endDate } });
                
                 // Simplistic growth rate - might need refinement based on definition
                 const previousTotalUsers = await User.countDocuments({ [dateField]: { $lt: startDate } });
                 const growthRate = previousTotalUsers > 0 ? ((totalUsers / previousTotalUsers) - 1) : (totalUsers > 0 ? Infinity : 0); 

                 const metrics = {
                     newUsers: newUsers,
                     totalUsers: totalUsers,
                     growthRate: parseFloat(growthRate.toFixed(4)),
                     period: { start: startDate.toISOString(), end: endDate.toISOString() },
                     comparisonPeriod: 'total'
                 };
                 logger.info('Total user growth metrics calculated', metrics);
                 return metrics;
            }
            
            // --- Aggregation for comparison periods ---
            const { dateFormat, dateTrunc } = getDateFormatForAggregation(comparisonPeriod, dateField);
             if (!dateFormat || !dateTrunc) {
                throw new Error(`Invalid comparison period specified: ${comparisonPeriod}`);
             }

             const pipeline = [
                 { // Match users created within the overall date range
                    $match: {
                        [dateField]: { $gte: startDate, $lte: endDate }
                    }
                 },
                 { // Group by the specified period
                    $group: {
                         _id: { period: dateTrunc },
                         newUsers: { $sum: 1 }
                    }
                 },
                 { // Project the results into the desired shape
                    $project: {
                        _id: 0,
                        period: '$_id.period', // Start of the period
                        newUsers: 1,
                        // Note: Calculating totalUsers *at the end of each period* within a single aggregation is complex.
                        // It often requires multiple stages or lookups. 
                        // We'll return only newUsers per period for now for simplicity.
                        // Total users can be derived on the frontend by summing newUsers if needed for a chart.
                        // Or, fetch total users at the start date separately if growth rate per period is essential.
                    }
                 },
                 {
                     $sort: { period: 1 } // Sort chronologically
                 }
             ];

             logger.debug('User growth aggregation pipeline:', JSON.stringify(pipeline));
             const results = await User.aggregate(pipeline);

             logger.info(`User growth metrics calculated for period: ${comparisonPeriod}`, { count: results.length });

            // Add total users at the start for context if needed
            const totalUsersAtStart = await User.countDocuments({ [dateField]: { $lt: startDate } });

             // Return array of results
             return {
                 results: results,
                 totalAtStart: totalUsersAtStart,
                 period: { start: startDate.toISOString(), end: endDate.toISOString() },
                 comparisonPeriod: comparisonPeriod
             };

        } catch (error) {
            logger.error(`Error calculating user growth metrics (period: ${comparisonPeriod}):`, error);
             if (error.message.includes('Invalid comparison period')) {
                 throw error; 
             }
            if (!User || typeof User.aggregate !== 'function' || typeof User.countDocuments !== 'function') {
                 logger.error('User model or its methods (aggregate, countDocuments) are not available/defined.');
                 throw new Error('Analytics Service Misconfiguration: User model not available.');
             }
            throw new Error('Failed to calculate user growth metrics due to a database or aggregation error.');
        }
    }

    /**
     * Calculates verification rate metrics, potentially grouped by a comparison period.
     *
     * @param {Date} startDate - The start date for the reporting period.
     * @param {Date} endDate - The end date for the reporting period.
     * @param {string} [comparisonPeriod='total'] - Grouping period ('day', 'week', 'month', 'year', or 'total').
     * @returns {Promise<object|Array>} Metrics object (for 'total') or array of metric objects (for other periods).
     */
    async getVerificationRateMetrics(startDate, endDate, comparisonPeriod = 'total') {
        logger.info('Calculating verification rate metrics', { startDate, endDate, comparisonPeriod });
        try {
            const dateFieldForStatusChange = 'updatedAt'; // When status changed
            const dateFieldForSubmission = 'createdAt'; // When submitted

            // Match documents within the date range based on submission time
            const matchStage = {
                $match: {
                    [dateFieldForSubmission]: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            };

            // If only total is needed, use simpler count methods (more efficient)
            if (comparisonPeriod === 'total') {
                 const approved = await VerificationRepository.countByStatusAndDateRange('Approved', startDate, endDate, dateFieldForStatusChange);
                 const rejected = await VerificationRepository.countByStatusAndDateRange('Rejected', startDate, endDate, dateFieldForStatusChange);
                 const submitted = await VerificationRepository.countByDateRange(startDate, endDate, dateFieldForSubmission);
                 const pending = await VerificationRepository.countByStatus('Pending'); // Total pending
                 const totalDecided = approved + rejected;
                 const approvalRate = totalDecided > 0 ? (approved / totalDecided) : 0;

                 const metrics = {
                    submitted: submitted, 
                    approved: approved,
                    rejected: rejected,
                    currentlyPending: pending,
                    approvalRate: parseFloat(approvalRate.toFixed(4)),
                    period: { start: startDate.toISOString(), end: endDate.toISOString() },
                    comparisonPeriod: 'total'
                 };
                 logger.info('Total verification rate metrics calculated', metrics);
                 return metrics;
            }

            // --- Aggregation for comparison periods (day, week, month, year) ---
            const { dateFormat, dateTrunc } = getDateFormatForAggregation(comparisonPeriod, dateFieldForSubmission);
             if (!dateFormat || !dateTrunc) {
                throw new Error(`Invalid comparison period specified: ${comparisonPeriod}`);
             }

             // Aggregation pipeline
             const pipeline = [
                matchStage,
                {
                    $group: {
                        _id: { 
                            // Group by the truncated date (day, start of week/month/year)
                            period: dateTrunc 
                        },
                        // Count submissions within each period
                        submitted: { $sum: 1 }, 
                        // Conditionally count status changes *within the period* 
                        // Note: This relies on updatedAt also being within the $match range implicitly or explicitly
                        // This part might need refinement depending on exact requirements 
                        // (e.g., count approvals/rejections regardless of submission date within the period?)
                        approved: { 
                            $sum: { 
                                $cond: [ { $eq: ['$status', 'Approved'] }, 1, 0 ] 
                            }
                        },
                        rejected: {
                            $sum: {
                                $cond: [ { $eq: ['$status', 'Rejected'] }, 1, 0 ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the default _id
                        period: '$_id.period', // The start of the period (day, week, month, year)
                        submitted: 1,
                        approved: 1,
                        rejected: 1,
                        // Calculate approval rate for the period
                        approvalRate: {
                            $let: {
                                vars: { totalDecided: { $add: ['$approved', '$rejected'] } },
                                in: {
                                    $cond: [ { $gt: ['$$totalDecided', 0] }, { $divide: ['$approved', '$$totalDecided'] }, 0 ]
                                }
                            }
                        }
                    }
                },
                {
                     $sort: { period: 1 } // Sort chronologically
                }
             ];

             logger.debug('Verification aggregation pipeline:', JSON.stringify(pipeline));
             // TODO: Need Verification model to run aggregation directly
             // const results = await Verification.aggregate(pipeline); 
             // Replace VerificationRepository with Verification model or adapt repo
             // For now, assume VerificationRepository exposes an aggregate method
             const results = await VerificationRepository.aggregate(pipeline);

             logger.info(`Verification metrics calculated for period: ${comparisonPeriod}`, { count: results.length });
             
             // Add currently pending count (doesn't fit aggregation easily)
             // This could be fetched separately or added post-aggregation if needed per period (more complex)
             const pendingTotal = await VerificationRepository.countByStatus('Pending');
             
             // Return array of results, potentially adding pendingTotal to the response structure if needed
             return {
                results: results.map(r => ({ ...r, approvalRate: parseFloat(r.approvalRate.toFixed(4)) })), 
                currentlyPending: pendingTotal, // Overall pending count
                period: { start: startDate.toISOString(), end: endDate.toISOString() },
                comparisonPeriod: comparisonPeriod
             };

        } catch (error) {
            logger.error(`Error calculating verification rate metrics (period: ${comparisonPeriod}):`, error);
            // Add more specific error checks if needed
             if (error.message.includes('Invalid comparison period')) {
                 throw error; // Re-throw specific known errors
             }
            if (!VerificationRepository) {
                 logger.error('VerificationRepository or its methods are not properly defined.');
                 throw new Error('Analytics Service Misconfiguration: VerificationRepository not available.');
             }
            throw new Error('Failed to calculate verification rate metrics due to a database or aggregation error.');
        }
    }

    /**
     * Calculates service usage metrics, potentially grouped by a comparison period.
     *
     * @param {Date} startDate - The start date for the reporting period.
     * @param {Date} endDate - The end date for the reporting period.
     * @param {string} [comparisonPeriod='total'] - Grouping period ('day', 'week', 'month', 'year', or 'total').
     * @returns {Promise<object|Array>} Metrics object (for 'total') or array of metric objects (for other periods).
     */
    async getServiceUsageMetrics(startDate, endDate, comparisonPeriod = 'total') {
        logger.info('Calculating service usage metrics', { startDate, endDate, comparisonPeriod });
        try {
            const dateField = 'timestamp'; // Field indicating event time
            const matchStage = {
                $match: {
                    [dateField]: { $gte: startDate, $lte: endDate }
                }
            };

            // --- Total Calculation (existing logic) ---
            if (comparisonPeriod === 'total') {
                // Existing total aggregation logic (slightly refactored)
                const usageCountsPipeline = [
                    matchStage, 
                    { $group: { _id: '$eventType', count: { $sum: 1 } } },
                    { $project: { _id: 0, eventType: '$_id', count: 1 } }
                ];
                const apiCallPipeline = [
                     matchStage,
                     { $match: { eventType: 'API_CALL' } },
                     { $group: { _id: '$details.path', count: { $sum: 1 }, avgDurationMs: { $avg: '$details.durationMs' } } },
                     { $sort: { count: -1 } },
                     { $limit: 10 },
                     { $project: { _id: 0, path: '$_id', count: 1, avgDurationMs: { $round: ['$avgDurationMs', 2] } } }
                 ];
                
                const [usageCounts, topEndpoints] = await Promise.all([
                    ServiceUsageLog.aggregate(usageCountsPipeline),
                    ServiceUsageLog.aggregate(apiCallPipeline)
                ]);
                
                const metrics = {
                    totalEvents: usageCounts.reduce((sum, item) => sum + item.count, 0),
                    eventsByType: usageCounts.reduce((acc, item) => { acc[item.eventType] = item.count; return acc; }, {}),
                    topApiEndpoints: topEndpoints,
                    period: { start: startDate.toISOString(), end: endDate.toISOString() },
                    comparisonPeriod: 'total'
                 };
                 // Ensure primary tracked metrics are present
                 const primaryEventTypes = ['API_CALL', 'APPOINTMENT_CREATED', 'VIDEO_SESSION_START'];
                 primaryEventTypes.forEach(type => {
                     if (!metrics.eventsByType[type]) metrics.eventsByType[type] = 0;
                 });

                 logger.info('Total service usage metrics calculated', metrics);
                return metrics;
            }

            // --- Aggregation for comparison periods ---
             const { dateFormat, dateTrunc } = getDateFormatForAggregation(comparisonPeriod, dateField);
             if (!dateFormat || !dateTrunc) {
                throw new Error(`Invalid comparison period specified: ${comparisonPeriod}`);
             }

             // Group by period and eventType to get counts per type per period
             const pipeline = [
                 matchStage,
                 {
                    $group: {
                        _id: {
                            period: dateTrunc,
                            eventType: '$eventType'
                        },
                        count: { $sum: 1 }
                    }
                 },
                 { // Regroup by period to structure eventsByType
                    $group: {
                        _id: '$_id.period',
                        events: {
                            $push: {
                                k: '$_id.eventType',
                                v: '$count'
                            }
                        }
                    }
                 },
                 {
                     $project: {
                         _id: 0,
                         period: '$_id',
                         eventsByType: { $arrayToObject: '$events' },
                         // totalEvents: { $sum: '$events.v' } // Calculate total if needed
                     }
                 },
                  {
                     $sort: { period: 1 } // Sort chronologically
                 }
             ];

             logger.debug('Service usage aggregation pipeline:', JSON.stringify(pipeline));
             const results = await ServiceUsageLog.aggregate(pipeline);

            // Ensure primary event types are present in each period's eventsByType
            const primaryEventTypes = ['API_CALL', 'APPOINTMENT_CREATED', 'VIDEO_SESSION_START'];
            results.forEach(result => {
                primaryEventTypes.forEach(type => {
                    if (!result.eventsByType[type]) {
                        result.eventsByType[type] = 0;
                    }
                });
                 // Calculate total events per period if needed
                 result.totalEvents = Object.values(result.eventsByType).reduce((sum, count) => sum + count, 0);
            });

             logger.info(`Service usage metrics calculated for period: ${comparisonPeriod}`, { count: results.length });

            // Top API endpoints don't aggregate well by period, omit for comparison view
            return {
                 results: results, 
                 period: { start: startDate.toISOString(), end: endDate.toISOString() },
                 comparisonPeriod: comparisonPeriod
             };

        } catch (error) {
            logger.error(`Error calculating service usage metrics (period: ${comparisonPeriod}):`, error);
            if (error.message.includes('Invalid comparison period')) {
                 throw error; 
             }
             if (!ServiceUsageLog || typeof ServiceUsageLog.aggregate !== 'function') {
                 logger.error('ServiceUsageLog model or its aggregate method not available/defined.');
                 throw new Error('Analytics Service Misconfiguration: ServiceUsageLog model not available.');
             }
            throw new Error('Failed to calculate service usage metrics due to a database or aggregation error.');
        }
    }

    /**
     * Calculates user counts segmented by role.
     * @returns {Promise<Array<{ segment: string, count: number }>>} Array of segment counts.
     */
    async getUserSegmentsByRole() {
        logger.info('Calculating user segments by role');
        if (!User) {
            logger.error('User model not available for segmentation analysis.');
            throw new Error('Segmentation Analysis Misconfiguration: User model not available.');
        }
        try {
            const segmentation = await User.aggregate([
                {
                    $match: { 
                        // Optional: Add filters like { isActive: true } if needed
                    }
                },
                {
                    $group: {
                        _id: '$role', // Group by the role field (assuming it holds role name or ID)
                        count: { $sum: 1 }
                    }
                },
                {
                     // Optionally perform $lookup if role field is an ObjectId to get role name
                     /*
                     $lookup: {
                         from: 'roles', // Assuming a 'roles' collection
                         localField: '_id',
                         foreignField: '_id',
                         as: 'roleDetails'
                     }
                     */
                },
                 {
                     $project: {
                         _id: 0,
                         // segment: { $ifNull: [ { $arrayElemAt: ['$roleDetails.name', 0] }, 'Unknown Role' ] }, // Use role name if lookup is done
                         segment: { $ifNull: ['$_id', 'Unknown Role'] }, // Use role field directly if it stores the name
                         count: 1
                    }
                 },
                 { 
                    $sort: { count: -1 } // Sort by count descending
                 }
            ]);

            logger.info('User segments by role calculated', { count: segmentation.length });
            return segmentation;

        } catch (error) {
            logger.error('Error calculating user segments by role:', error);
            throw new Error('Failed to calculate user segments by role.');
        }
    }

    // Add other analytics methods as needed (e.g., retention, revenue, etc.)

}

module.exports = new AnalyticsService(); 