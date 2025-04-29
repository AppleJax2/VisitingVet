import React, { useState, useEffect, useRef } from 'react';
import {
    adminGetUserGrowthMetrics,
    adminGetVerificationRateMetrics,
    adminGetServiceUsageMetrics,
    adminGetUserSegmentsByRole
} from '../../services/api'; // Adjust path as needed
// Removed MUI imports: Card, CardContent, Typography, Grid, CircularProgress, Box

// Import Bootstrap-based chart components
import UserGrowthChart from '../../components/Admin/Charts/UserGrowthChart'; // Assuming this is also Bootstrap based or compatible
import VerificationMetricsChart from '../../components/Admin/Charts/VerificationMetricsChart';
import DateRangeSelector from '../../components/Admin/DateRangeSelector'; // Import the date selector
import ComparisonSelector from '../../components/Admin/ComparisonSelector'; // Import the comparison selector
import ServiceUsageChart from '../../components/Admin/Charts/ServiceUsageChart'; // Import the new chart
import ExportButton from '../../components/Admin/ExportButton'; // Import the export button
import UserSegmentationChart from '../../components/Admin/Charts/UserSegmentationChart'; // Import segmentation chart
import AnomalyNotifications from '../../components/Admin/AnomalyNotifications'; // Import component
import io from 'socket.io-client'; // Import socket.io client
import { useAuth } from '../../contexts/AuthContext'; // For socket auth
import logger from '../../utils/logger'; // For logging

// Import shared Bootstrap components (assuming they exist)
import LoadingSpinner from '../../components/Shared/LoadingSpinner'; // Corrected to default import
import ErrorMessage from '../../components/Shared/ErrorMessage'; // Corrected to default import

// Bootstrap Placeholder Chart Component
const PlaceholderChart = ({ title }) => (
    <div className="card h-100">
        <div className="card-body d-flex flex-column align-items-center justify-content-center">
            <h5 className="card-title">{title}</h5>
            <p className="card-text text-muted">Chart Component Placeholder</p>
        </div>
    </div>
);

// Bootstrap Metric Card Component
const MetricCard = ({ title, value, loading }) => (
    <div className="card h-100">
        <div className="card-body">
            <h6 className="card-subtitle mb-2 text-muted">{title}</h6>
            <div style={{ minHeight: '2rem' }}> {/* Prevent layout shift during loading */} 
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <LoadingSpinner small={true} /> 
                    </div>
                 ) : (
                    <h4 className="card-title">{value ?? 'N/A'}</h4>
                 )
                }
            </div>
        </div>
    </div>
);

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function AdminAnalyticsDashboardPage() {
    // Default date range (e.g., last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const today = new Date();

    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);
    const [comparisonPeriod, setComparisonPeriod] = useState('day'); // Default to daily comparison
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userGrowthData, setUserGrowthData] = useState(null);
    const [verificationData, setVerificationData] = useState(null);
    const [usageData, setUsageData] = useState(null);
    const [segmentationData, setSegmentationData] = useState(null); // Add state for segmentation
    const [segmentationLoading, setSegmentationLoading] = useState(true); // Separate loading state
    const [segmentationError, setSegmentationError] = useState(null); // Separate error state
    const [anomalies, setAnomalies] = useState([]); // State to hold detected anomalies
    const { user } = useAuth();
    const socketRef = useRef(null);

    const handleDatesChange = (newStartDate, newEndDate) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    const handlePeriodChange = (newPeriod) => {
        setComparisonPeriod(newPeriod);
    };

    // Handler to dismiss an anomaly notification
    const dismissAnomaly = (indexToRemove) => {
        setAnomalies(prevAnomalies => prevAnomalies.filter((_, index) => index !== indexToRemove));
    };

    useEffect(() => {
        const fetchCoreAnalytics = async () => {
            if (!startDate || !endDate || startDate > endDate) {
                setError("Invalid date range selected.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            const params = { startDate: startDate.toISOString(), endDate: endDate.toISOString(), comparisonPeriod: comparisonPeriod };
            try {
                const [growthRes, verificationRes, usageRes] = await Promise.allSettled([
                    adminGetUserGrowthMetrics(params),
                    adminGetVerificationRateMetrics(params),
                    adminGetServiceUsageMetrics(params)
                ]);
                if (growthRes.status === 'fulfilled') setUserGrowthData(growthRes.value);
                else console.error("Failed to fetch user growth:", growthRes.reason);
                if (verificationRes.status === 'fulfilled') setVerificationData(verificationRes.value);
                else console.error("Failed to fetch verification metrics:", verificationRes.reason);
                if (usageRes.status === 'fulfilled') setUsageData(usageRes.value);
                else console.error("Failed to fetch usage metrics:", usageRes.reason);
                const firstError = [growthRes, verificationRes, usageRes].find(r => r.status === 'rejected');
                if (firstError) setError(firstError.reason?.response?.data?.message || firstError.reason?.message || 'Failed to load some analytics data.');
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
                console.error("Error fetching core analytics dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        // Fetch segmentation data (doesn't depend on date/period)
        const fetchSegmentation = async () => {
            setSegmentationLoading(true);
            setSegmentationError(null);
            try {
                const segments = await adminGetUserSegmentsByRole();
                setSegmentationData(segments); // API directly returns { results: [...], criteria: '...' }
            } catch (err) {
                console.error("Error fetching segmentation data:", err);
                setSegmentationError(err.response?.data?.message || err.message || 'Failed to fetch segmentation data.');
            } finally {
                setSegmentationLoading(false);
            }
        };

        fetchCoreAnalytics();
        fetchSegmentation(); 
    }, [startDate, endDate, comparisonPeriod]);

    // Effect for WebSocket connection and listeners
    useEffect(() => {
        if (!user?.token) {
            logger.warn('No auth token, WebSocket connection not established for Admin Analytics.');
            return;
        }

        socketRef.current = io(SOCKET_SERVER_URL, {
            auth: { token: user.token },
            reconnectionAttempts: 5
        });
        const socket = socketRef.current;

        socket.on('connect', () => logger.info('Admin Analytics WebSocket connected.'));
        socket.on('connect_error', (err) => logger.error('Admin Analytics WebSocket connection error:', err));
        socket.on('disconnect', (reason) => logger.warn(`Admin Analytics WebSocket disconnected: ${reason}`));

        // Listen for specific updates (e.g., verification count - handled elsewhere or could be added here)
        // socket.on('analyticsUpdate', (data) => { ... });

        // Listen for anomaly detection events
        socket.on('anomalyDetected', (anomalyData) => {
            logger.warn('Anomaly detected via WebSocket:', anomalyData);
            // Add new anomaly to the start of the array, maybe limit array size
            setAnomalies(prevAnomalies => [anomalyData, ...prevAnomalies].slice(0, 5)); // Keep max 5
        });

        return () => {
            if (socket) {
                logger.info('Disconnecting Admin Analytics WebSocket.');
                socket.disconnect();
                socketRef.current = null;
            }
        };
    }, [user]); // Dependency on user ensures reconnection on login/logout

    const renderTopEndpoints = () => {
        if (loading) {
            return <LoadingSpinner small={true} />;
        }
        if (usageData?.comparisonPeriod === 'total' && usageData?.topApiEndpoints && usageData.topApiEndpoints.length > 0) {
             return (
                 <ul className="list-group list-group-flush">
                     {usageData.topApiEndpoints.map((ep, index) => (
                         <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                             <span className="text-break me-2">{ep.path}</span>
                             <span className="badge bg-primary rounded-pill ms-2">{ep.count}</span>
                             <span className="badge bg-secondary rounded-pill ms-2">{ep.avgDurationMs}ms</span>
                         </li>
                     ))}
                 </ul>
             );
        }
        return <p className="text-muted mb-0">No API usage data available.</p>;
    };

    return (
        <div className="container-fluid p-3">
            {/* Render Anomaly Notifications */}
            <AnomalyNotifications anomalies={anomalies} onDismiss={dismissAnomaly} />
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                 <h1 className="h3 mb-0">Admin Analytics Dashboard</h1>
                 <ExportButton 
                    userGrowthData={userGrowthData}
                    verificationData={verificationData}
                    usageData={usageData}
                    dateRange={{ start: startDate, end: endDate }}
                    comparisonPeriod={comparisonPeriod}
                 />
            </div>

            {/* Date Range and Comparison Selectors */}
            <div className="row mb-3">
                 <div className="col-lg-8">
                     <DateRangeSelector 
                        initialStartDate={startDate}
                        initialEndDate={endDate}
                        onDatesChange={handleDatesChange}
                    />
                </div>
                 <div className="col-lg-4 d-flex align-items-center justify-content-lg-end">
                     <ComparisonSelector 
                        currentPeriod={comparisonPeriod}
                        onPeriodChange={handlePeriodChange}
                    />
                </div>
            </div>

            {error && <ErrorMessage message={error} />} {/* Render Bootstrap alert */}

            {/* Display Key Metrics */}
            <Row>
                {loading ? (
                    <Col><p>Loading key metrics...</p></Col>
                ) : error ? (
                    <Col><Alert variant="danger">{error}</Alert></Col>
                ) : (
                    <Col md={3}>
                        <Card className="text-center mb-3">
                            <Card.Body>
                                <Card.Title>New Users</Card.Title>
                                <h3 className={`fw-bold text-${userGrowthData?.newUsers >= 0 ? 'success' : 'danger'}`}>{userGrowthData?.newUsers}</h3>
                                {userGrowthData?.newUsers !== undefined && (
                                    <small className={`text-${userGrowthData.newUsers >= 0 ? 'success' : 'danger'}`}>
                                        {userGrowthData.newUsers >= 0 ? '▲' : '▼'} {userGrowthData.newUsers.toFixed(1)}% {comparisonPeriod}
                                    </small>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                )}
                <Col md={3}>
                    <Card className="text-center mb-3">
                        <Card.Body>
                            <Card.Title>Total Users</Card.Title>
                            <h3 className={`fw-bold text-${userGrowthData?.totalUsers >= 0 ? 'success' : 'danger'}`}>{userGrowthData?.totalUsers}</h3>
                            {userGrowthData?.totalUsers !== undefined && (
                                <small className={`text-${userGrowthData.totalUsers >= 0 ? 'success' : 'danger'}`}>
                                    {userGrowthData.totalUsers >= 0 ? '▲' : '▼'} {userGrowthData.totalUsers.toFixed(1)}% {comparisonPeriod}
                                </small>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center mb-3">
                        <Card.Body>
                            <Card.Title>Verification Approval Rate</Card.Title>
                            <h3 className={`fw-bold text-${verificationData?.approvalRate !== undefined ? verificationData.approvalRate >= 0 ? 'success' : 'danger' : 'muted'}`}>
                                {verificationData?.approvalRate !== undefined ? `${(verificationData.approvalRate * 100).toFixed(1)}%` : 'N/A'}
                            </h3>
                            {verificationData?.approvalRate !== undefined && (
                                <small className={`text-${verificationData.approvalRate >= 0 ? 'success' : 'danger'}`}>
                                    {verificationData.approvalRate >= 0 ? '▲' : '▼'} {(verificationData.approvalRate * 100).toFixed(1)}% {comparisonPeriod}
                                </small>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center mb-3">
                        <Card.Body>
                            <Card.Title>API Calls</Card.Title>
                            <h3 className={`fw-bold text-${usageData?.eventsByType?.API_CALL >= 0 ? 'success' : 'danger'}`}>{usageData?.eventsByType?.API_CALL}</h3>
                            {usageData?.eventsByType?.API_CALL !== undefined && (
                                <small className={`text-${usageData.eventsByType.API_CALL >= 0 ? 'success' : 'danger'}`}>
                                    {usageData.eventsByType.API_CALL >= 0 ? '▲' : '▼'} {usageData.eventsByType.API_CALL.toFixed(1)} {comparisonPeriod}
                                </small>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Display Charts */}
            <Row>
                <Col md={6} className="mb-3">
                    <Card>
                        <Card.Header>Verification Rate</Card.Header>
                        <Card.Body>
                            {loading ? <LoadingSpinner/> : error ? <Alert variant="danger">{error}</Alert> : 
                                <VerificationMetricsChart
                                    data={verificationData?.results || []}
                                    loading={loading}
                                    error={error ? { message: error } : null}
                                />
                            }
                        </Card.Body>
                    </Card>
                </Col>
                 <Col md={6} className="mb-3">
                    <Card>
                        <Card.Header>User Growth</Card.Header>
                        <Card.Body>
                            {loading ? <LoadingSpinner/> : error ? <Alert variant="danger">{error}</Alert> : 
                                <UserGrowthChart
                                    data={userGrowthData?.results || []}
                                    loading={loading}
                                    error={error ? { message: error } : null}
                                />
                            }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Row 3: More Charts/Data (Service Usage, Segmentation) */}
            <div className="row gy-3">
                <div className="col-12 col-lg-6">
                    <ServiceUsageChart data={usageData?.results || []} loading={loading} error={error} />
                </div>
                <div className="col-12 col-lg-6">
                     {/* Replace Top API Endpoints card with Segmentation Chart */}
                    <UserSegmentationChart 
                        data={segmentationData} 
                        loading={segmentationLoading} 
                        error={segmentationError} 
                        title="User Segmentation by Role"
                    />
                </div>
            </div>
        </div>
    );
}

export default AdminAnalyticsDashboardPage; 