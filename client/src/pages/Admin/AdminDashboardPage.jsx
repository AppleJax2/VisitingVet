import React from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, ProgressBar } from 'react-bootstrap';
import { 
  PeopleFill, 
  PatchCheckFill, 
  ClipboardDataFill, 
  PersonFillCheck, 
  PersonFillX, 
  ArrowUp, 
  ArrowDown, 
  Calendar2Check,
  ClockFill
} from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

// Note: To fully implement charts, install either react-chartjs-2 or recharts package
// This is a simplified version without actual chart libraries

const AdminDashboardPage = () => {
  // Placeholder data for dashboard
  const stats = {
    totalUsers: 5842,
    userIncrease: 7.2,
    totalProviders: 248,
    providerIncrease: 12.5,
    pendingVerifications: 17,
    actionsToday: 126,
    appointments: 430,
    appointmentIncrease: 9.3
  };

  // Recent user registrations data
  const recentUsers = [
    { id: 1, name: 'John Smith', email: 'john.smith@example.com', role: 'Pet Owner', date: '2023-09-15', status: 'Active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'MVSProvider', date: '2023-09-14', status: 'Pending' },
    { id: 3, name: 'Mike Williams', email: 'mike.w@example.com', role: 'Clinic', date: '2023-09-13', status: 'Active' },
    { id: 4, name: 'Emily Davis', email: 'emily.d@example.com', role: 'Pet Owner', date: '2023-09-12', status: 'Active' },
  ];

  // Verification completion data for progress bars
  const verificationCategories = [
    { name: 'Identity Verification', completed: 85 },
    { name: 'Professional Credentials', completed: 72 },
    { name: 'Background Checks', completed: 91 },
    { name: 'Reference Validation', completed: 64 }
  ];
  
  return (
    <Container fluid className="p-0">
      {/* Stats Summary */}
      <Row className="g-4 mb-4">
        <Col xl={3} md={6}>
          <Card className="h-100 border-0 shadow-sm rounded-3 dashboard-card fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="text-muted">Total Users</div>
                <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                  <PeopleFill className="text-primary" size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-1">{stats.totalUsers.toLocaleString()}</h3>
              <div className={`small ${stats.userIncrease >= 0 ? 'text-success' : 'text-danger'}`}>
                {stats.userIncrease >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {Math.abs(stats.userIncrease)}% since last month
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="h-100 border-0 shadow-sm rounded-3 dashboard-card fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="text-muted">Providers</div>
                <div className="bg-success bg-opacity-10 p-2 rounded-circle">
                  <PersonFillCheck className="text-success" size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-1">{stats.totalProviders.toLocaleString()}</h3>
              <div className={`small ${stats.providerIncrease >= 0 ? 'text-success' : 'text-danger'}`}>
                {stats.providerIncrease >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {Math.abs(stats.providerIncrease)}% since last month
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="h-100 border-0 shadow-sm rounded-3 dashboard-card fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="text-muted">Pending Verifications</div>
                <div className="bg-warning bg-opacity-10 p-2 rounded-circle">
                  <PatchCheckFill className="text-warning" size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-1">{stats.pendingVerifications}</h3>
              <div className="small">
                <Link to="/admin/verifications" className="text-decoration-none">Review requests &rarr;</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="h-100 border-0 shadow-sm rounded-3 dashboard-card fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Card.Body className="p-3">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="text-muted">Appointments</div>
                <div className="bg-info bg-opacity-10 p-2 rounded-circle">
                  <Calendar2Check className="text-info" size={20} />
                </div>
              </div>
              <h3 className="fw-bold mb-1">{stats.appointments.toLocaleString()}</h3>
              <div className={`small ${stats.appointmentIncrease >= 0 ? 'text-success' : 'text-danger'}`}>
                {stats.appointmentIncrease >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {Math.abs(stats.appointmentIncrease)}% since last month
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* User Activity Chart */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-3 h-100 dashboard-card fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Card.Header className="bg-white px-4 py-3 border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">User Activity</h5>
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2">Weekly</Button>
                  <Button variant="primary" size="sm">Monthly</Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {/* Placeholder for Chart.js or Recharts chart */}
              <div className="text-center p-5 bg-light rounded-3 text-muted">
                <p className="mb-0">User Activity Chart would appear here</p>
                <p className="small mb-0">Requires Chart.js or Recharts integration</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Verification Progress */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100 dashboard-card fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Card.Header className="bg-white px-4 py-3 border-0">
              <h5 className="mb-0">Verification Completion</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {verificationCategories.map((category, index) => (
                <div key={index} className="mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <span>{category.name}</span>
                    <span>{category.completed}%</span>
                  </div>
                  <ProgressBar 
                    now={category.completed} 
                    variant={
                      category.completed < 70 ? "warning" : 
                      category.completed < 90 ? "info" : "success"
                    }
                    style={{ height: '8px' }}
                  />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Users Table */}
      <Card className="border-0 shadow-sm rounded-3 mb-4 dashboard-card fade-in-up" style={{ animationDelay: '0.7s' }}>
        <Card.Header className="bg-white px-4 py-3 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Recent User Registrations</h5>
            <Button as={Link} to="/admin/users" variant="primary" size="sm">View All</Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Date</th>
                <th className="px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-4">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.role === 'MVSProvider' ? (
                      <Badge bg="success">Provider</Badge>
                    ) : user.role === 'Clinic' ? (
                      <Badge bg="info">Clinic</Badge>
                    ) : (
                      <Badge bg="secondary">Pet Owner</Badge>
                    )}
                  </td>
                  <td>{user.date}</td>
                  <td className="px-4">
                    {user.status === 'Active' ? (
                      <Badge bg="success" className="px-3 py-2 rounded-pill">Active</Badge>
                    ) : user.status === 'Pending' ? (
                      <Badge bg="warning" className="px-3 py-2 rounded-pill">Pending</Badge>
                    ) : (
                      <Badge bg="danger" className="px-3 py-2 rounded-pill">Inactive</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm rounded-3 dashboard-card fade-in-up" style={{ animationDelay: '0.8s' }}>
        <Card.Header className="bg-white px-4 py-3 border-0">
          <h5 className="mb-0">Quick Actions</h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Row>
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <Button 
                as={Link} 
                to="/admin/verifications" 
                variant="outline-primary" 
                className="w-100 p-3 d-flex flex-column align-items-center"
              >
                <PatchCheckFill size={24} className="mb-2" />
                <span>Review Verifications</span>
              </Button>
            </Col>
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <Button 
                as={Link} 
                to="/admin/users" 
                variant="outline-primary" 
                className="w-100 p-3 d-flex flex-column align-items-center"
              >
                <PeopleFill size={24} className="mb-2" />
                <span>Manage Users</span>
              </Button>
            </Col>
            <Col md={3} sm={6} className="mb-3 mb-md-0">
              <Button 
                as={Link} 
                to="/admin/logs" 
                variant="outline-primary" 
                className="w-100 p-3 d-flex flex-column align-items-center"
              >
                <ClipboardDataFill size={24} className="mb-2" />
                <span>View Logs</span>
              </Button>
            </Col>
            <Col md={3} sm={6}>
              <Button 
                as={Link} 
                to="/admin/settings" 
                variant="outline-primary" 
                className="w-100 p-3 d-flex flex-column align-items-center"
              >
                <ClockFill size={24} className="mb-2" />
                <span>System Status</span>
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboardPage; 