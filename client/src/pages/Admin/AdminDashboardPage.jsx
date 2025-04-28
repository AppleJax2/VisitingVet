import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import VerificationMetricsCard from '../../components/Admin/VerificationMetricsCard';

const AdminDashboardPage = () => {
  return (
    <Container fluid>
      <h2 className="mb-4">Admin Overview</h2>
      <Row>
        <Col lg={4} md={6} className="mb-3">
          <VerificationMetricsCard />
        </Col>
        <Col lg={4} md={6} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Users</Card.Title>
              <Card.Text>
                Manage users, view details, and handle bans.
              </Card.Text>
              {/* TODO: Add User Metrics Card */}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Action Logs</Card.Title>
              <Card.Text>
                View recent administrator actions.
              </Card.Text>
              {/* TODO: Add link or recent logs */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Add more sections like Analytics Overview etc. */}
    </Container>
  );
};

export default AdminDashboardPage; 