import React from 'react';
// Use Line and Bar from recharts
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
// Assuming standard Bootstrap CSS is linked in the main HTML file

// Shared components likely using Bootstrap
import LoadingSpinner from '../../Shared/LoadingSpinner'; // Corrected to default import
import ErrorMessage from '../../Shared/ErrorMessage'; // Corrected to default import

// Updated to accept data, loading, and error states as props
const VerificationMetricsChart = ({ data: apiData, loading, error }) => {

    const isComparisonView = apiData && apiData.comparisonPeriod && apiData.comparisonPeriod !== 'total';
    const results = isComparisonView ? apiData.results : null; // Array for line chart
    const totals = (!isComparisonView && apiData) ? apiData : null; // Object for bar chart

    // Prepare data for Bar chart (Total view)
    const totalBarChartData = totals ? [
        { name: 'Submitted', value: totals.submitted },
        { name: 'Approved', value: totals.approved },
        { name: 'Rejected', value: totals.rejected },
        { name: 'Pending', value: totals.currentlyPending },
    ] : [];

    // Prepare data for Line chart (Comparison view)
    // Assuming results is an array like [{ period: Date, submitted: n, approved: n, rejected: n, approvalRate: n }, ...]
    const comparisonLineChartData = results ? results.map(point => ({
         period: new Date(point.period).toLocaleDateString(), // Format date for XAxis label
         Submitted: point.submitted,
         Approved: point.approved,
         Rejected: point.rejected,
         // approvalRate: point.approvalRate // Could add another line if needed
     })) : [];

    return (
        <div className="card h-100"> {/* Use Bootstrap card class, h-100 for full height */}
            <div className="card-header">
                <h5 className="card-title mb-0">Verification Metrics {isComparisonView ? `(${apiData.comparisonPeriod})` : '(Total)'}</h5>
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
                                        <Line type="monotone" dataKey="Submitted" stroke={COLORS.Submitted} name="Submitted" />
                                        <Line type="monotone" dataKey="Approved" stroke={COLORS.Approved} name="Approved" />
                                        <Line type="monotone" dataKey="Rejected" stroke={COLORS.Rejected} name="Rejected" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-muted mt-3">No verification metrics data available for comparison.</p>
                            )
                        ) : (
                             // Render Bar Chart for total
                             totalBarChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={totalBarChartData}
                                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" name="Count">
                                            {totalBarChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#000000'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                             ) : (
                                <p className="text-center text-muted mt-3">No verification metrics data available.</p>
                             )
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

export default VerificationMetricsChart; 