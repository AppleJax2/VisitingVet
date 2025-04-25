import React, { useState, useEffect } from 'react';
import { checkAuthStatus, logout } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Button, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await checkAuthStatus();
        if (data && data.success) {
          setUser(data.user);
        } else {
          // Not authenticated or error
          navigate('/login');
        }
      } catch (err) {
        setError('Session check failed. Please login again.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/login');
    } catch (err) {
      setError('Logout failed. Please try again.');
    }
  };

  const renderPetOwnerDashboard = () => (
    <Row>
      <Col md={8} className="mx-auto">
        <Card className="mb-4">
          <Card.Body className="text-center">
            <h4>Welcome to VisitingVet.com</h4>
            <p>Find a veterinarian who can visit your home, saving you and your pets the stress of a clinic visit.</p>
            <Button 
              variant="primary" 
              size="lg" 
              as={Link} 
              to="/search-providers"
              className="mt-3"
            >
              Find a Visiting Vet
            </Button>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Header as="h5">Your Pets</Card.Header>
          <Card.Body className="text-center">
            <p>You haven't added any pets yet. Add your first pet to get started.</p>
            <Button variant="outline-primary" disabled>
              Add a Pet (Coming Soon)
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderVisitingVetDashboard = () => (
    <Row>
      <Col md={8} className="mx-auto">
        <Card className="mb-4">
          <Card.Body className="text-center">
            <h4>Visiting Vet Dashboard</h4>
            <p>Manage your professional profile and services to attract pet owners in need of veterinary care.</p>
            <Button 
              variant="primary" 
              size="lg" 
              as={Link} 
              to="/provider-profile"
              className="mt-3"
            >
              Manage My Profile & Services
            </Button>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Header as="h5">Appointment Requests</Card.Header>
          <Card.Body className="text-center">
            <p>You don't have any appointment requests yet.</p>
            <p>Complete your profile to start receiving appointments.</p>
            <Button variant="outline-primary" disabled>
              Manage Appointments (Coming Soon)
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderClinicDashboard = () => (
    <Row>
      <Col md={8} className="mx-auto">
        <Card>
          <Card.Body className="text-center">
            <h4>Clinic Dashboard</h4>
            <p>Clinic-specific features are coming soon.</p>
            <Button variant="outline-primary" disabled>
              Clinic Features (Coming Soon)
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <Button variant="outline-danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {user && (
        <>
          <Card className="mb-4">
            <Card.Body>
              <p className="mb-0">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="mb-0">
                <strong>Account Type:</strong> {user.role === 'MVSProvider' ? 'Visiting Vet Provider' : user.role}
              </p>
            </Card.Body>
          </Card>
          
          {user.role === 'PetOwner' && renderPetOwnerDashboard()}
          {user.role === 'MVSProvider' && renderVisitingVetDashboard()}
          {user.role === 'Clinic' && renderClinicDashboard()}
        </>
      )}
    </Container>
  );
}

export default DashboardPage; 