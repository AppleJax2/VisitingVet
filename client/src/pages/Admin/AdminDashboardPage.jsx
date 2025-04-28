import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AdminDashboardPage = () => {
  return (
    <Container fluid>
      <h2 className="mb-4">Admin Overview</h2>
      <Row>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Users</Card.Title>
              <Card.Text>
                Manage users, view details, and handle bans.
              </Card.Text>
              {/* Add stats later */}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Verifications</Card.Title>
              <Card.Text>
                Review pending verification requests.
              </Card.Text>
              {/* Add stats later */}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Action Logs</Card.Title>
              <Card.Text>
                View recent administrator actions.
              </Card.Text>
              {/* Add quick links or recent logs later */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Add more widgets or charts later */}
    </Container>
  );
};

export default AdminDashboardPage; 