import React, { useState, useEffect } from 'react';
import { 
    adminGetUserGrowthMetrics,
    adminGetVerificationRateMetrics,
    adminGetServiceUsageMetrics
} from '../../services/api'; // Adjust path as needed
import { Card, CardContent, Typography, Grid, CircularProgress, Box } from '@mui/material'; // Assuming Material UI is used

// Placeholder components for charts (will be implemented in later tasks)
const PlaceholderChart = ({ title }) => (
    <Card sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent>
            <Typography variant="h6" component="div" gutterBottom>
                {title}
            </Typography>
            <Typography color="text.secondary">Chart Component Placeholder</Typography>
        </CardContent>
    </Card>
);

const MetricCard = ({ title, value, loading }) => (
    <Card>
        <CardContent>
            <Typography color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h5" component="div">
                {loading ? <CircularProgress size={24} /> : value ?? 'N/A'}
            </Typography>
        </CardContent>
    </Card>
);

function AdminAnalyticsDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userGrowthData, setUserGrowthData] = useState(null);
    const [verificationData, setVerificationData] = useState(null);
    const [usageData, setUsageData] = useState(null);
    // TODO: Add state for date range filters

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch all metrics in parallel
                const [growthRes, verificationRes, usageRes] = await Promise.allSettled([
                    adminGetUserGrowthMetrics(), // Add date range params later
                    adminGetVerificationRateMetrics(), // Add date range params later
                    adminGetServiceUsageMetrics() // Add date range params later
                ]);

                if (growthRes.status === 'fulfilled') setUserGrowthData(growthRes.value);
                else console.error("Failed to fetch user growth:", growthRes.reason);
                
                if (verificationRes.status === 'fulfilled') setVerificationData(verificationRes.value);
                 else console.error("Failed to fetch verification metrics:", verificationRes.reason);

                if (usageRes.status === 'fulfilled') setUsageData(usageRes.value);
                 else console.error("Failed to fetch usage metrics:", usageRes.reason);

                // Handle cases where one or more requests failed
                const firstError = [growthRes, verificationRes, usageRes].find(r => r.status === 'rejected');
                if (firstError) {
                   setError(firstError.reason?.message || 'Failed to load some analytics data.');
                }

            } catch (err) {
                console.error("Error fetching analytics dashboard data:", err);
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // TODO: Add date range dependency later

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom component="div">
                Admin Analytics Dashboard
            </Typography>
            
            {/* TODO: Add Date Range Selector Component Here */}

            {error && <Typography color="error">Error: {error}</Typography>}

            <Grid container spacing={3}>
                {/* Row 1: Key Metrics */}
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard title="New Users (30d)" value={userGrowthData?.newUsers} loading={loading} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard title="Total Users" value={userGrowthData?.totalUsers} loading={loading} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                     <MetricCard 
                        title="Verification Approval Rate (30d)" 
                        value={verificationData?.approvalRate !== undefined ? `${(verificationData.approvalRate * 100).toFixed(1)}%` : null} 
                        loading={loading} 
                    />
                </Grid>
                 <Grid item xs={12} sm={6} md={3}>
                    <MetricCard title="API Calls (30d)" value={usageData?.eventsByType?.API_CALL} loading={loading} />
                </Grid>
                
                {/* Row 2: Charts */}
                 <Grid item xs={12} md={6}>
                    <PlaceholderChart title="User Growth Over Time" />
                 </Grid>
                 <Grid item xs={12} md={6}>
                    <PlaceholderChart title="Verification Metrics" />
                 </Grid>
                 
                 {/* Row 3: More Charts/Data */}
                  <Grid item xs={12} md={6}>
                    <PlaceholderChart title="Service Usage Breakdown" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                      {/* Placeholder for Top API Endpoints or other data */}
                       <Card>
                            <CardContent>
                                <Typography variant="h6">Top API Endpoints (Last 30d)</Typography>
                                {loading && <CircularProgress size={20} />}
                                {!loading && usageData?.topApiEndpoints && (
                                    <ul>
                                        {usageData.topApiEndpoints.map((ep, index) => (
                                            <li key={index}>{ep.path} ({ep.count} calls, {ep.avgDurationMs}ms avg)</li>
                                        ))}
                                    </ul>
                                )}
                                {!loading && (!usageData || !usageData.topApiEndpoints || usageData.topApiEndpoints.length === 0) && (
                                    <Typography color="text.secondary">No API usage data available.</Typography>
                                )}
                            </CardContent>
                       </Card>
                  </Grid>
            </Grid>
        </Box>
    );
}

export default AdminAnalyticsDashboardPage; 