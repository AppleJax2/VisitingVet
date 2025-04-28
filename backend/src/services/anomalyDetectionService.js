const logger = require('../utils/logger');
const AnalyticsService = require('./analyticsService'); // Import AnalyticsService
const cron = require('node-cron');
const config = require('../config'); 
const webSocketService = require('./websocketService'); // Import WebSocket service

// Basic standard deviation function (can use a library like 'simple-statistics' for more robust methods)
const calculateStdDev = (arr) => {
    if (!arr || arr.length < 2) return 0;
    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b) / n;
    const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1); // Sample variance
    return Math.sqrt(variance);
};

class AnomalyDetectionService {

    constructor() {
        logger.info('AnomalyDetectionService initialized');
        this.schedulePeriodicChecks(); // Schedule checks on initialization
    }

    /**
     * Detects anomalies in daily new user signups using 3-sigma rule.
     *
     * @param {number} historyDays - How many days of historical data to consider (excluding today).
     * @param {number} [stdDevThreshold=3] - How many standard deviations from the mean define an anomaly.
     * 
     * @returns {Promise<{ isAnomaly: boolean, message: string|null, details: object }>} 
     */
    async detectDailyNewUserAnomaly(historyDays = 30, stdDevThreshold = 3) {
        const metricName = 'dailyNewUsers';
        logger.info(`Checking for anomalies in metric: ${metricName}`, { historyDays, stdDevThreshold });

        try {
            // --- Fetch historical and latest data ---
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const historyStartDate = new Date(yesterday);
            historyStartDate.setDate(yesterday.getDate() - historyDays);
            
             logger.debug('Fetching data for anomaly detection', { 
                 latestPeriod: `${format(yesterday, 'yyyy-MM-dd')} to ${format(yesterday, 'yyyy-MM-dd')}`,
                 historyPeriod: `${format(historyStartDate, 'yyyy-MM-dd')} to ${format(new Date(yesterday).setDate(yesterday.getDate() - 1), 'yyyy-MM-dd')}`
             });

            // Get latest value (yesterday's count)
            const latestData = await AnalyticsService.getUserGrowthMetrics(yesterday, yesterday, 'day');
             // getUserGrowthMetrics with comparison='day' should return { results: [{ period: date, newUsers: count }], ... }
             const latestValue = latestData?.results?.[0]?.newUsers;
             if (latestValue === undefined || latestValue === null) {
                 logger.warn('Could not retrieve latest value for dailyNewUsers anomaly check.');
                 return { isAnomaly: false, message: 'Could not retrieve latest metric value.', details: {} };
             }

            // Get historical data (previous N days, grouped daily)
             const historyEndDate = new Date(yesterday); // End date for history is day before yesterday
             historyEndDate.setDate(yesterday.getDate() - 1);
             if (historyStartDate > historyEndDate) {
                 logger.warn('Not enough history for anomaly check', { historyStartDate, historyEndDate });
                 return { isAnomaly: false, message: 'Not enough historical data for analysis (less than 1 day).' };
             }
             
            const historicalResult = await AnalyticsService.getUserGrowthMetrics(historyStartDate, historyEndDate, 'day');
            const historicalData = historicalResult?.results?.map(r => r.newUsers) || [];

            if (historicalData.length < 2) {
                 logger.info('Not enough historical data points for std dev calculation.');
                 return { isAnomaly: false, message: 'Not enough historical data for analysis.', details: { mean: null, stdDev: null, threshold: null, latestValue } };
            }
            // --- Perform Calculation --- 
            const mean = historicalData.reduce((a, b) => a + b) / historicalData.length;
            const stdDev = calculateStdDev(historicalData);
            const upperThreshold = mean + (stdDevThreshold * stdDev);
            const lowerThreshold = Math.max(0, mean - (stdDevThreshold * stdDev));
            
            const isAnomaly = latestValue > upperThreshold || latestValue < lowerThreshold;
            let message = null;
            if (isAnomaly) {
                message = `Anomaly detected for ${metricName}: Yesterday's value (${latestValue}) is outside the expected range (${lowerThreshold.toFixed(2)} - ${upperThreshold.toFixed(2)}). Historical Mean (last ${historyDays} days): ${mean.toFixed(2)}, StdDev: ${stdDev.toFixed(2)}.`;
                logger.warn(message); // Log anomaly warning
            } else {
                 message = `No anomaly detected for ${metricName}. Yesterday's value (${latestValue}) is within the expected range.`;
                 logger.info(message); // Log normal check result
            }
            
            const details = {
                 metricName,
                 latestValue,
                 mean: parseFloat(mean.toFixed(2)),
                 stdDev: parseFloat(stdDev.toFixed(2)),
                 upperThreshold: parseFloat(upperThreshold.toFixed(2)),
                 lowerThreshold: parseFloat(lowerThreshold.toFixed(2)),
                 historyDays,
                 stdDevThreshold,
                 checkTimestamp: new Date().toISOString()
            };
            
             // --- Emit event if anomaly detected --- 
             if (isAnomaly) {
                webSocketService.emitToRoom('admin-analytics', 'anomalyDetected', details);
             }
            
            return { isAnomaly, message, details };

        } catch (error) {
            logger.error(`Error during anomaly detection for ${metricName}:`, error);
            return {
                isAnomaly: false,
                message: `Error performing anomaly detection: ${error.message}`,
                details: { metricName }
            };
        }
    }

    // Schedule the periodic check
    schedulePeriodicChecks() {
         // Example: Run daily at 3:00 AM UTC
         const schedule = config.anomalyCheckSchedules?.dailyNewUsers || '0 3 * * *';
         if (cron.validate(schedule)) {
             cron.schedule(schedule, async () => {
                 logger.info('Running scheduled daily new user anomaly check...');
                 await this.detectDailyNewUserAnomaly(); // Use default history/threshold
             }, {
                 scheduled: true,
                 timezone: "UTC"
             });
             logger.info(`Daily new user anomaly check scheduled with cron pattern: ${schedule} (UTC)`);
         } else {
             logger.error(`Invalid cron pattern for daily new user anomaly check: ${schedule}. Check disabled.`);
         }
         // TODO: Add schedules for other metrics if needed
    }
    
    // --- Deprecated Placeholder ---
    /*
    async detectMetricAnomaly(metricName, latestValue, historyDays = 30, stdDevThreshold = 3) {
        // ... original placeholder ...
    }
    async runPeriodicChecks() {
        // ... original placeholder ...
    }
    */
}

module.exports = new AnomalyDetectionService(); 