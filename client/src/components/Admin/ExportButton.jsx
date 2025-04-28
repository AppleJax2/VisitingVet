import React from 'react';
import logger from '../../../utils/logger';

// Simple CSV escaping function
const escapeCsvCell = (cell) => {
    if (cell === null || cell === undefined) {
        return '';
    }
    const cellStr = String(cell);
    // If the cell contains a comma, double quote, or newline, enclose in double quotes
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        // Escape existing double quotes by doubling them
        return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
};

// Function to convert array of objects to CSV string
const convertToCsv = (dataArray, headers) => {
    if (!dataArray || dataArray.length === 0) {
        return '';
    }
    const headerRow = headers.map(escapeCsvCell).join(',');
    const dataRows = dataArray.map(row => 
        headers.map(header => escapeCsvCell(row[header])).join(',')
    );
    return [headerRow, ...dataRows].join('\n');
};

const ExportButton = ({ userGrowthData, verificationData, usageData, dateRange, comparisonPeriod }) => {

    const handleExport = () => {
        try {
            let csvContent = "data:text/csv;charset=utf-8,";
            const filenameBase = `analytics_export_${dateRange.start.toISOString().split('T')[0]}_to_${dateRange.end.toISOString().split('T')[0]}`;
            let finalFilename = `${filenameBase}.csv`;

            // --- User Growth Data --- 
            csvContent += "User Growth Data\n";
            if (userGrowthData) {
                 if (userGrowthData.comparisonPeriod !== 'total' && userGrowthData.results) {
                    finalFilename = `${filenameBase}_${userGrowthData.comparisonPeriod}.csv`;
                    const headers = ['period', 'newUsers']; // Add totalAtStart? depends on need
                    csvContent += convertToCsv(userGrowthData.results, headers);
                 } else {
                     // Handle total view data
                     const headers = ['metric', 'value'];
                     const totalData = [
                         { metric: 'New Users', value: userGrowthData.newUsers },
                         { metric: 'Total Users', value: userGrowthData.totalUsers },
                         { metric: 'Growth Rate', value: userGrowthData.growthRate },
                     ];
                     csvContent += convertToCsv(totalData, headers);
                 }
            } else {
                csvContent += "No data available\n";
            }
            csvContent += "\n\n"; // Separator

            // --- Verification Metrics Data ---
            csvContent += "Verification Metrics Data\n";
             if (verificationData) {
                 if (verificationData.comparisonPeriod !== 'total' && verificationData.results) {
                     finalFilename = `${filenameBase}_${verificationData.comparisonPeriod}.csv`;
                     const headers = ['period', 'submitted', 'approved', 'rejected', 'approvalRate'];
                     csvContent += convertToCsv(verificationData.results, headers);
                     // Add currentlyPending total separately if needed
                     csvContent += `\nCurrently Pending (Total),${escapeCsvCell(verificationData.currentlyPending)}\n`; 
                 } else {
                     const headers = ['metric', 'value'];
                     const totalData = [
                         { metric: 'Submitted', value: verificationData.submitted },
                         { metric: 'Approved', value: verificationData.approved },
                         { metric: 'Rejected', value: verificationData.rejected },
                         { metric: 'Currently Pending', value: verificationData.currentlyPending },
                         { metric: 'Approval Rate', value: verificationData.approvalRate },
                     ];
                      csvContent += convertToCsv(totalData, headers);
                 }
             } else {
                 csvContent += "No data available\n";
             }
            csvContent += "\n\n";

             // --- Service Usage Data ---
            csvContent += "Service Usage Data\n";
             if (usageData) {
                 if (usageData.comparisonPeriod !== 'total' && usageData.results) {
                     finalFilename = `${filenameBase}_${usageData.comparisonPeriod}.csv`;
                      // Flatten eventsByType for CSV
                     const headers = ['period', 'API_CALL', 'APPOINTMENT_CREATED', 'VIDEO_SESSION_START', 'totalEvents']; // Add more event types if needed
                     const flattenedResults = usageData.results.map(r => ({
                         period: r.period,
                         API_CALL: r.eventsByType?.API_CALL || 0,
                         APPOINTMENT_CREATED: r.eventsByType?.APPOINTMENT_CREATED || 0,
                         VIDEO_SESSION_START: r.eventsByType?.VIDEO_SESSION_START || 0,
                         totalEvents: r.totalEvents || 0
                     }));
                     csvContent += convertToCsv(flattenedResults, headers);
                 } else {
                     // Handle total view data
                     const headers = ['metric', 'value'];
                     const eventTypes = usageData.eventsByType || {};
                     const totalData = [
                         { metric: 'Total Events', value: usageData.totalEvents },
                         { metric: 'API Calls', value: eventTypes.API_CALL },
                         { metric: 'Appointments Created', value: eventTypes.APPOINTMENT_CREATED },
                         { metric: 'Video Sessions Started', value: eventTypes.VIDEO_SESSION_START },
                          // Add other event types
                     ];
                     csvContent += convertToCsv(totalData, headers);
                     csvContent += "\nTop API Endpoints\n";
                     if(usageData.topApiEndpoints && usageData.topApiEndpoints.length > 0) {
                        const endpointHeaders = ['path', 'count', 'avgDurationMs'];
                        csvContent += convertToCsv(usageData.topApiEndpoints, endpointHeaders);
                     } else {
                         csvContent += "No data available\n";
                     }
                 }
             } else {
                 csvContent += "No data available\n";
             }

            // Create download link and trigger click
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', finalFilename);
            document.body.appendChild(link); // Required for FF
            link.click();
            document.body.removeChild(link);
            logger.info('Analytics data exported successfully', { filename: finalFilename });

        } catch (err) {
            logger.error('Error during CSV export:', err);
            // Maybe show a user-facing error message here
            alert('An error occurred while exporting the data. Please try again.');
        }
    };

    // Disable button if data is loading or not available? Or let user export empty file?
    // Let's disable if no data is present at all.
    const isDisabled = !userGrowthData && !verificationData && !usageData;

    return (
        <button 
            type="button" 
            className="btn btn-success ms-2" 
            onClick={handleExport}
            disabled={isDisabled}
        >
            <i className="bi bi-download me-2"></i> {/* Assuming Bootstrap Icons */} 
            Export CSV
        </button>
    );
};

export default ExportButton; 