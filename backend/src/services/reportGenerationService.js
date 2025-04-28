const fs = require('fs').promises;
const path = require('path');
const AnalyticsService = require('./analyticsService');
const { convertToCsv } = require('../utils/csvUtils');
const logger = require('../utils/logger');
const config = require('../config'); // Assuming config holds report path
const cron = require('node-cron'); // Import node-cron

// Ensure reports directory exists
const REPORTS_DIR = path.join(__dirname, '..', '..' , 'reports'); // e.g., backend/reports/
const ensureReportsDir = async () => {
    try {
        await fs.access(REPORTS_DIR);
    } catch (error) {
        if (error.code === 'ENOENT') {
            logger.info(`Reports directory (${REPORTS_DIR}) does not exist. Creating...`);
            await fs.mkdir(REPORTS_DIR, { recursive: true });
        } else {
            throw error; // Re-throw other errors
        }
    }
};

class ReportGenerationService {

    constructor() {
        ensureReportsDir().catch(err => {
             logger.error('Failed to ensure reports directory exists:', err);
             // Decide how to handle this - maybe disable report generation?
        });
    }

    /**
     * Generates a consolidated analytics report for a given period.
     * @param {Date} startDate - The start date for the report.
     * @param {Date} endDate - The end date for the report.
     * @param {string} [reportType='daily'] - Identifier for the report type (e.g., 'daily', 'weekly').
     * @returns {Promise<{ filePath: string, csvContent: string }>} Path to the generated report file and its content.
     */
    async generateAnalyticsReport(startDate, endDate, reportType = 'period') {
        logger.info(`Generating ${reportType} analytics report for ${startDate.toISOString()} to ${endDate.toISOString()}`);
        
        try {
            // Fetch data using AnalyticsService (using 'total' comparison period for consolidated report)
            const [userGrowthData, verificationData, usageData] = await Promise.all([
                AnalyticsService.getUserGrowthMetrics(startDate, endDate, 'total'),
                AnalyticsService.getVerificationRateMetrics(startDate, endDate, 'total'),
                AnalyticsService.getServiceUsageMetrics(startDate, endDate, 'total'),
            ]);

            let csvContent = "";
            const filenameBase = `analytics_report_${reportType}_${endDate.toISOString().split('T')[0]}`;
            const finalFilename = `${filenameBase}.csv`;
            const filePath = path.join(REPORTS_DIR, finalFilename);

            // --- User Growth Data --- 
            csvContent += "User Growth Data\n";
            if (userGrowthData) {
                 const headers = ['metric', 'value'];
                 const totalData = [
                     { metric: 'New Users', value: userGrowthData.newUsers },
                     { metric: 'Total Users', value: userGrowthData.totalUsers },
                     { metric: 'Growth Rate', value: userGrowthData.growthRate },
                 ];
                 csvContent += convertToCsv(totalData, headers);
            } else {
                csvContent += "No data available\n";
            }
            csvContent += "\n\n";

            // --- Verification Metrics Data ---
            csvContent += "Verification Metrics Data\n";
             if (verificationData) {
                 const headers = ['metric', 'value'];
                 const totalData = [
                     { metric: 'Submitted', value: verificationData.submitted },
                     { metric: 'Approved', value: verificationData.approved },
                     { metric: 'Rejected', value: verificationData.rejected },
                     { metric: 'Currently Pending', value: verificationData.currentlyPending },
                     { metric: 'Approval Rate', value: verificationData.approvalRate },
                 ];
                 csvContent += convertToCsv(totalData, headers);
             } else {
                 csvContent += "No data available\n";
             }
            csvContent += "\n\n";

             // --- Service Usage Data ---
             csvContent += "Service Usage Data\n";
             if (usageData) {
                 const headers = ['metric', 'value'];
                 const eventTypes = usageData.eventsByType || {};
                 const totalData = [
                     { metric: 'Total Events', value: usageData.totalEvents },
                     { metric: 'API Calls', value: eventTypes.API_CALL },
                     { metric: 'Appointments Created', value: eventTypes.APPOINTMENT_CREATED },
                     { metric: 'Video Sessions Started', value: eventTypes.VIDEO_SESSION_START },
                 ];
                 csvContent += convertToCsv(totalData, headers);
                 csvContent += "\nTop API Endpoints\n";
                 if(usageData.topApiEndpoints && usageData.topApiEndpoints.length > 0) {
                    const endpointHeaders = ['path', 'count', 'avgDurationMs'];
                    csvContent += convertToCsv(usageData.topApiEndpoints, endpointHeaders);
                 } else {
                     csvContent += "No data available\n";
                 }
             } else {
                 csvContent += "No data available\n";
             }

            // Save the report file
            await fs.writeFile(filePath, csvContent, 'utf8');
            logger.info(`Analytics report saved successfully to: ${filePath}`);

            // Optionally: Trigger email notification with the report attached
            // await EmailService.sendReportEmail(filePath, reportType, endDate);

            return { filePath, csvContent };

        } catch (error) {
            logger.error(`Error generating ${reportType} analytics report:`, error);
            throw new Error(`Failed to generate ${reportType} analytics report.`);
            // Consider more specific error handling/notifications
        }
    }
    
    /**
     * Sets up scheduled tasks for generating reports using node-cron.
     */
    setupScheduledReports() {
        logger.info('Setting up scheduled report generation...');

        // Example: Schedule a daily report at 2:00 AM UTC
        // Cron syntax: second minute hour day-of-month month day-of-week
        // '0 2 * * *' means at minute 0 past hour 2 (2:00 AM) every day
        const dailySchedule = config.reportSchedules?.daily || '0 2 * * *'; 

        if (cron.validate(dailySchedule)) {
            cron.schedule(dailySchedule, async () => {
                logger.info('Running scheduled daily analytics report generation...');
                try {
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - 1); // Previous day
                    
                    await this.generateAnalyticsReport(startDate, endDate, 'daily');
                    logger.info('Scheduled daily report generated successfully.');
                } catch (error) {
                    logger.error('Scheduled daily report generation failed:', error);
                }
            }, {
                scheduled: true,
                timezone: "UTC" // Use UTC or configure based on requirements
            });
            logger.info(`Daily analytics report scheduled with cron pattern: ${dailySchedule} (UTC)`);
        } else {
             logger.error(`Invalid cron pattern specified for daily report: ${dailySchedule}. Daily reports disabled.`);
        }

        // TODO: Add schedules for weekly, monthly reports if needed, reading patterns from config
        // Example weekly:
        // const weeklySchedule = config.reportSchedules?.weekly || '0 3 * * 0'; // e.g., 3 AM UTC on Sunday
        // if (cron.validate(weeklySchedule)) { ... cron.schedule(...) ... }

        logger.info('Scheduled report generation setup complete.');
    }
}

module.exports = new ReportGenerationService(); 