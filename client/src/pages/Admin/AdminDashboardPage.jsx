import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import VerificationMetricsCard from '../../components/Admin/VerificationMetricsCard';
import AdminSummaryCard from '../../components/Admin/AdminSummaryCard';
import { FaUsers, FaHourglassHalf, FaFlag } from 'react-icons/fa';
import { adminGetDashboardStats } from '../../services/api';
import RecentActivityLogs from '../../components/Admin/RecentActivityLogs';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      setStatsError(null);
      try {
        const response = await adminGetDashboardStats();
        if (response.success) {
          setStats(response.data || {});
        } else {
          throw new Error(response.message || 'Failed to fetch dashboard stats');
        }
      } catch (err) {
        console.error("Fetch Admin Stats Error:", err);
        setStatsError(err.message || 'Could not load dashboard statistics.');
      }
      finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Container fluid className="p-3">
      <h2 className="mb-4">Admin Overview</h2>
      {statsError && <Alert variant="danger">{statsError}</Alert>}
      <Row>
        <Col lg={4} md={6} className="mb-3">
          <VerificationMetricsCard />
        </Col>
        <Col md={4} className="mb-4">
          <AdminSummaryCard 
            title="Total Users" 
            value={loadingStats ? '...' : stats.totalUsers ?? 'N/A'} 
            icon={<FaUsers />} 
            variant="primary"
            linkTo="/admin/users"
            isLoading={loadingStats}
          />
        </Col>
        <Col md={4} className="mb-4">
          <AdminSummaryCard 
            title="Pending Verifications" 
            value={loadingStats ? '...' : stats.pendingVerifications ?? 'N/A'} 
            icon={<FaHourglassHalf />} 
            variant="warning"
            linkTo="/admin/verification-queue"
            isLoading={loadingStats}
          />
        </Col>
        <Col md={4} className="mb-4">
          <AdminSummaryCard 
            title="Flagged Activity" 
            value={loadingStats ? '...' : stats.flaggedActivities ?? 'N/A'} 
            icon={<FaFlag />} 
            variant="danger"
            linkTo="/admin/logs?level=WARN"
            isLoading={loadingStats}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header>User Growth</Card.Header>
            <Card.Body className="text-center">
              <p className="text-muted">User Growth Chart Placeholder</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header>Recent Activity Logs</Card.Header>
            <Card.Body className="p-0">
              <RecentActivityLogs />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add more sections like Analytics Overview etc. */}
    </Container>
  );
};

export default AdminDashboardPage; 