/**
 * Provides helper functions for constructing MongoDB aggregation pipelines,
 * particularly for date-based grouping.
 */

const logger = require('./logger');

/**
 * Returns MongoDB aggregation expressions for formatting and truncating dates based on a period.
 * 
 * @param {string} period - The desired grouping period ('day', 'week', 'month', 'year').
 * @param {string} dateField - The name of the date field in the documents (e.g., 'createdAt'). Defaults to 'timestamp'.
 * @param {string} timezone - Optional timezone string (e.g., 'America/New_York'). Defaults to UTC.
 * @returns {{ dateFormat: object|null, dateTrunc: object|null }} Object containing $dateToString format and $dateTrunc expression.
 */
const getDateFormatForAggregation = (period, dateField = 'timestamp', timezone = 'UTC') => {
    let dateFormat = null;
    let dateTrunc = null;
    const dateExpr = { date: `$${dateField}`, timezone };

    switch (period) {
        case 'day':
            dateFormat = { $dateToString: { format: '%Y-%m-%d', ...dateExpr } };
            dateTrunc = { $dateTrunc: { date: `$${dateField}`, unit: 'day', timezone } };
            break;
        case 'week':
            // ISO week date format: YYYY-WW (e.g., 2023-52)
            dateFormat = { $dateToString: { format: '%G-%V', ...dateExpr } }; 
            // Truncate to the start of the ISO week (Monday)
            dateTrunc = { $dateTrunc: { date: `$${dateField}`, unit: 'week', timezone, startOfWeek: 'monday' } }; 
            break;
        case 'month':
            dateFormat = { $dateToString: { format: '%Y-%m', ...dateExpr } };
            dateTrunc = { $dateTrunc: { date: `$${dateField}`, unit: 'month', timezone } };
            break;
        case 'year':
            dateFormat = { $dateToString: { format: '%Y', ...dateExpr } };
            dateTrunc = { $dateTrunc: { date: `$${dateField}`, unit: 'year', timezone } };
            break;
        default:
            logger.warn(`Invalid comparison period provided for aggregation: ${period}`);
            return { dateFormat: null, dateTrunc: null };
    }

    return { dateFormat, dateTrunc };
};

module.exports = {
    getDateFormatForAggregation,
}; 