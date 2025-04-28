import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import VerificationMetricsCard from '../../components/Admin/VerificationMetricsCard';
import AdminSummaryCard from '../../components/Admin/AdminSummaryCard';
import { FaUsers, FaHourglassHalf, FaFlag } from 'react-icons/fa';

const AdminDashboardPage = () => {
  return (
    <Container fluid>
      <h2 className="mb-4">Admin Overview</h2>
      <Row>
        <Col lg={4} md={6} className="mb-3">
          <VerificationMetricsCard />
        </Col>
        <Col md={4} className="mb-4">
          <AdminSummaryCard 
            title="Total Users" 
            value={stats.totalUsers ?? '...'} 
            icon={<FaUsers />} 
            variant="primary"
            linkTo="/admin/users"
          />
          {/* User Metrics Card Placeholder */}
        </Col>
        <Col md={4} className="mb-4">
          <AdminSummaryCard 
            title="Pending Verifications" 
            value={stats.pendingVerifications ?? '...'} 
            icon={<FaHourglassHalf />} 
            variant="warning"
            linkTo="/admin/verification-queue"
          />
        </Col>
        <Col md={4} className="mb-4">
          <AdminSummaryCard 
            title="Flagged Activity" 
            value={stats.flaggedActivities ?? '...'} 
            icon={<FaFlag />} 
            variant="danger"
            linkTo="/admin/logs?level=WARN"
          />
        </Col>
      </Row>

      {/* Other sections like charts, recent activity */}
      <Row>
        <Col md={6} className="mb-4">
          {/* Placeholder for a chart (e.g., User Growth) */}
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
            <Card.Body>
              {/* Placeholder for recent logs list */}
              <p className="text-muted">Recent system activity will appear here.</p>
              {/* Link or recent logs placeholder */}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add more sections like Analytics Overview etc. */}
    </Container>
  );
};

export default AdminDashboardPage; 