import React from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

// Bootstrap components
import LoadingSpinner from '../../Shared/LoadingSpinner';
import ErrorMessage from '../../Shared/ErrorMessage';

// Define colors for different event types
const EVENT_COLORS = {
    API_CALL: '#8884d8', // Purple
    APPOINTMENT_CREATED: '#82ca9d', // Green
    VIDEO_SESSION_START: '#ffc658', // Yellow
    // Add other event types if needed
};

const ServiceUsageChart = ({ data: apiData, loading, error }) => {

    const isComparisonView = apiData && apiData.comparisonPeriod && apiData.comparisonPeriod !== 'total';
    const results = isComparisonView ? apiData.results : null; // Array for line chart
    const totals = (!isComparisonView && apiData) ? apiData : null; // Object for potential total display

    // Prepare data for Line chart (Comparison view)
    // Assuming results is an array like [{ period: Date, eventsByType: { API_CALL: n, ... }, totalEvents: n }, ...]
    const comparisonLineChartData = results ? results.map(point => ({
         period: new Date(point.period).toLocaleDateString(), // Format date for XAxis label
         API_CALL: point.eventsByType?.API_CALL || 0,
         APPOINTMENT_CREATED: point.eventsByType?.APPOINTMENT_CREATED || 0,
         VIDEO_SESSION_START: point.eventsByType?.VIDEO_SESSION_START || 0,
         // Add other key event types if needed
     })) : [];

    return (
        <div className="card h-100">
            <div className="card-header">
                <h5 className="card-title mb-0">Service Usage Trend {isComparisonView ? `(${apiData.comparisonPeriod})` : '(Total)'}</h5>
            </div>
            <div className="card-body d-flex flex-column">
                {loading && <div className="d-flex justify-content-center align-items-center flex-grow-1"><LoadingSpinner /></div>}
                {error && <div className="d-flex justify-content-center align-items-center flex-grow-1"><ErrorMessage message={error.message || 'Error loading chart data.'} /></div>}
                {!loading && !error && apiData && (
                    <div className="flex-grow-1" style={{ minHeight: '250px', position: 'relative' }}>
                        {isComparisonView ? (
                            // Render Line Chart for comparison
                            comparisonLineChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart 
                                        data={comparisonLineChartData}
                                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        {/* Add lines for key event types */}
                                        <Line type="monotone" dataKey="API_CALL" stroke={EVENT_COLORS.API_CALL} name="API Calls" />
                                        <Line type="monotone" dataKey="APPOINTMENT_CREATED" stroke={EVENT_COLORS.APPOINTMENT_CREATED} name="Appointments" />
                                        <Line type="monotone" dataKey="VIDEO_SESSION_START" stroke={EVENT_COLORS.VIDEO_SESSION_START} name="Video Starts" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-muted mt-3">No service usage data available for comparison.</p>
                            )
                        ) : (
                             // Display totals if not in comparison view (e.g., list key metrics)
                             <div className="mt-3">
                                 <h6>Total Events: {totals?.totalEvents ?? 'N/A'}</h6>
                                 <ul className="list-unstyled">
                                     <li>API Calls: {totals?.eventsByType?.API_CALL ?? 'N/A'}</li>
                                     <li>Appointments Created: {totals?.eventsByType?.APPOINTMENT_CREATED ?? 'N/A'}</li>
                                     <li>Video Sessions Started: {totals?.eventsByType?.VIDEO_SESSION_START ?? 'N/A'}</li>
                                     {/* List other key totals if needed */}
                                 </ul>
                                 <small className="text-muted">Period: {new Date(totals?.period?.start).toLocaleDateString()} - {new Date(totals?.period?.end).toLocaleDateString()}</small>
                             </div>
                        )}
                    </div>
                )}
                 {!loading && !error && !apiData && (
                     <p className="text-center text-muted mt-3">No data available.</p>
                 )}
            </div>
        </div>
    );
};

export default ServiceUsageChart; 