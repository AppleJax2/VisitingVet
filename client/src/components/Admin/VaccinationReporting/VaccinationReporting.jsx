import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; // Assumed API service
import { Pie, Line } from 'react-chartjs-2'; // Import chart components
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title
} from 'chart.js';
import './VaccinationReporting.css'; // Basic styling
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap'; // Use Bootstrap layout

// Register Chart.js components
ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title
);

// Example colors for charts - Define or import from theme
const STATUS_COLORS = { // Use specific colors for statuses
    Verified: '#28a745', // Green
    Pending: '#ffc107',  // Yellow
    Rejected: '#dc3545'  // Red
};

const TREND_COLORS = {
    Submitted: '#007bff', // Blue
    Verified: '#28a745',  // Green
    Rejected: '#dc3545'   // Red
};

const VaccinationReporting = () => {
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReportData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/vaccinations/reports'); 
            if (response.data.success) {
                setReportData(response.data.data); 
            } else {
                 throw new Error(response.data.message || 'Failed to fetch report data');
            }
        } catch (err) {
            console.error('[Admin Reporting] Error fetching report data:', err);
            setError(err.response?.data?.message || 'Failed to load report data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);
    
    // --- Chart Data Preparation --- 
    const statusChartData = reportData ? {
        labels: ['Verified', 'Pending', 'Rejected'],
        datasets: [{
            data: [
                reportData.verifiedCount || 0,
                reportData.pendingCount || 0,
                reportData.rejectedCount || 0
            ],
            backgroundColor: [
                STATUS_COLORS.Verified,
                STATUS_COLORS.Pending,
                STATUS_COLORS.Rejected
            ],
            hoverOffset: 4
        }]
    } : { labels: [], datasets: [] };

    const trendsChartData = reportData ? {
        labels: reportData.trends?.map(t => t.date) || [], // Assuming date is the label (e.g., 'YYYY-MM')
        datasets: [
            {
                label: 'Submitted',
                data: reportData.trends?.map(t => t.submitted) || [],
                borderColor: TREND_COLORS.Submitted,
                tension: 0.1
            },
            {
                label: 'Verified',
                data: reportData.trends?.map(t => t.verified) || [],
                borderColor: TREND_COLORS.Verified,
                tension: 0.1
            },
             {
                label: 'Rejected',
                data: reportData.trends?.map(t => t.rejected) || [], // Add rejected if available
                borderColor: TREND_COLORS.Rejected,
                tension: 0.1
            }
        ]
    } : { labels: [], datasets: [] };
    // --- End Chart Data Preparation ---
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
         plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: { // Optional: customize tooltips
                    // label: function(context) {
                    //     let label = context.dataset.label || '';
                    //     if (label) {
                    //         label += ': ';
                    //     }
                    //     if (context.parsed.y !== null) {
                    //         label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                    //     }
                    //     return label;
                    // }
                }
            }
        }
    };
     const pieChartOptions = { ...chartOptions, plugins: { ...chartOptions.plugins, legend: { position: 'right' } } };

    return (
        <div className="vaccination-reporting">
            <h2>Vaccination Program Analytics</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {isLoading && <div className="text-center p-5"><Spinner animation="border" /> Loading report data...</div>}

            {reportData && !isLoading && (
                <Row className="g-3"> {/* Use Bootstrap Row and Col for layout */}
                    {/* Key Metrics Section */}
                    <Col md={6} lg={4}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title as="h6">Overall Status</Card.Title>
                                <p><strong>Total Records:</strong> {reportData.totalRecords}</p>
                                <p><strong>Verified:</strong> {reportData.verifiedCount}</p>
                                <p><strong>Pending:</strong> {reportData.pendingCount}</p>
                                <p><strong>Rejected:</strong> {reportData.rejectedCount}</p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6} lg={4}>
                         <Card className="h-100 shadow-sm">
                             <Card.Body>
                                 <Card.Title as="h6">Status Breakdown</Card.Title>
                                 {statusChartData.datasets[0]?.data?.some(v => v > 0) ? (
                                    <div style={{ height: '180px' }}> {/* Fixed height container */}
                                        <Pie data={statusChartData} options={pieChartOptions} />
                                    </div>
                                 ) : (
                                     <p className="text-muted text-center mt-3">No status data available.</p>
                                 )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6} lg={4}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title as="h6">Performance</Card.Title>
                                <p><strong>Avg. Verify Time:</strong> {reportData.verificationTimeAvg !== undefined ? `${reportData.verificationTimeAvg} days` : 'N/A'}</p>
                                <p><strong>Compliance Rate:</strong> {reportData.complianceRate !== undefined ? `${reportData.complianceRate}%` : 'N/A'}</p>
                                <p><strong>Suspicious Flags:</strong> {reportData.suspiciousFlags || 0}</p>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Trends Section */}
                    <Col md={12} lg={8}> {/* Make trends chart wider */}
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title as="h6">Verification Trends Over Time</Card.Title>
                                 {trendsChartData.labels?.length > 0 ? (
                                    <div style={{ height: '250px' }}> {/* Fixed height container */}
                                        <Line data={trendsChartData} options={chartOptions} />
                                    </div>
                                 ) : (
                                     <p className="text-muted text-center mt-3">No trend data available.</p>
                                 )}
                            </Card.Body>
                        </Card>
                    </Col>
                    
                     {/* Placeholder for additional charts/info */}
                     <Col md={6} lg={4}>
                        <Card className="shadow-sm h-100">
                            <Card.Body>
                                <Card.Title as="h6">Other Metrics</Card.Title>
                                <p className="text-muted text-center mt-3">Additional charts or data TBD.</p>
                            </Card.Body>
                        </Card>
                     </Col>

                </Row>
            )}
        </div>
    );
};

export default VaccinationReporting; 