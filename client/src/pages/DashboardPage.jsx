import React, { useState, useEffect } from 'react';
import { checkAuthStatus, logout } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Button, Spinner, Alert, Card, Row, Col, Badge } from 'react-bootstrap';
import theme from '../utils/theme';

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
        <Card className="mb-4 shadow-sm border-0">
          <Card.Body className="text-center">
            <h4>Welcome to VisitingVet.com</h4>
            <p>Find a veterinarian who can visit your home, saving you and your pets the stress of a clinic visit.</p>
            <div className="d-flex justify-content-center gap-3">
              <Button 
                variant="primary" 
                size="lg" 
                as={Link} 
                to="/search-providers"
                className="mt-3"
                style={{backgroundColor: theme.colors.secondary.main, borderColor: theme.colors.secondary.main}}
              >
                <i className="bi bi-search me-2"></i>
                Find a Visiting Vet
              </Button>
              <Button 
                variant="success" 
                size="lg" 
                as={Link} 
                to="/my-appointments"
                className="mt-3"
                style={{backgroundColor: theme.colors.primary.main, borderColor: theme.colors.primary.main}}
              >
                <i className="bi bi-calendar-check me-2"></i>
                My Appointments
              </Button>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="mb-4 shadow-sm border-0">
          <Card.Header as="h5" className="d-flex align-items-center" style={{backgroundColor: theme.colors.background.light}}>
            <i className="bi bi-calendar-date me-2"></i>
            Your Appointments
          </Card.Header>
          <Card.Body className="text-center">
            <p>View and manage your appointment requests with visiting veterinarians.</p>
            <Button 
              variant="outline-primary" 
              as={Link} 
              to="/my-appointments"
              style={{borderColor: theme.colors.primary.main, color: theme.colors.primary.main}}
            >
              <i className="bi bi-eye me-2"></i>
              View My Appointments
            </Button>
          </Card.Body>
        </Card>
        
        <Card className="shadow-sm border-0">
          <Card.Header as="h5" className="d-flex align-items-center" style={{backgroundColor: theme.colors.background.light}}>
            <i className="bi bi-heart me-2"></i>
            Your Pets
          </Card.Header>
          <Card.Body className="text-center">
            <p>You haven't added any pets yet. Add your first pet to get started.</p>
            <Button 
              variant="outline-primary" 
              disabled
              style={{borderColor: theme.colors.primary.main, color: theme.colors.primary.main}}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add a Pet (Coming Soon)
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderVisitingVetDashboard = () => (
    <>
      {/* Stats Section */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100 shadow-sm border-0 text-center">
            <Card.Body style={{backgroundColor: theme.colors.background.light, borderRadius: theme.borderRadius.md}}>
              <div className="mb-3" style={{color: theme.colors.primary.main}}>
                <i className="bi bi-calendar-check" style={{fontSize: '2rem'}}></i>
              </div>
              <h5>Pending Appointments</h5>
              <h2 className="mb-0">3</h2>
              <small className="text-muted">Awaiting confirmation</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm border-0 text-center">
            <Card.Body style={{backgroundColor: theme.colors.background.light, borderRadius: theme.borderRadius.md}}>
              <div className="mb-3" style={{color: theme.colors.primary.main}}>
                <i className="bi bi-check-circle" style={{fontSize: '2rem'}}></i>
              </div>
              <h5>Confirmed Appointments</h5>
              <h2 className="mb-0">5</h2>
              <small className="text-muted">Ready to serve</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm border-0 text-center">
            <Card.Body style={{backgroundColor: theme.colors.background.light, borderRadius: theme.borderRadius.md}}>
              <div className="mb-3" style={{color: theme.colors.primary.main}}>
                <i className="bi bi-star" style={{fontSize: '2rem'}}></i>
              </div>
              <h5>Average Rating</h5>
              <h2 className="mb-0">4.8</h2>
              <small className="text-muted">From 25 reviews</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 shadow-sm border-0 text-center">
            <Card.Body style={{backgroundColor: theme.colors.background.light, borderRadius: theme.borderRadius.md}}>
              <div className="mb-3" style={{color: theme.colors.primary.main}}>
                <i className="bi bi-wallet2" style={{fontSize: '2rem'}}></i>
              </div>
              <h5>Monthly Earnings</h5>
              <h2 className="mb-0">$2,450</h2>
              <small className="text-muted">Last 30 days</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="d-flex justify-content-between align-items-center" style={{backgroundColor: theme.colors.background.light}}>
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bi bi-person-badge me-2"></i>
                Provider Profile
              </h5>
              <Badge bg="primary" pill style={{backgroundColor: theme.colors.accent.gold}}>
                Premium
              </Badge>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column align-items-center mb-4">
                <div className="rounded-circle mb-3 overflow-hidden" style={{width: '120px', height: '120px', border: `3px solid ${theme.colors.accent.gold}`}}>
                  <img 
                    src="https://randomuser.me/api/portraits/women/68.jpg" 
                    alt="Provider Profile" 
                    className="img-fluid"
                  />
                </div>
                <h4>{user?.name || 'Dr. Sarah Johnson'}</h4>
                <p className="text-muted mb-1">Visiting Veterinarian</p>
                <div className="d-flex align-items-center">
                  <i className="bi bi-star-fill me-1" style={{color: '#f8ce0b'}}></i>
                  <i className="bi bi-star-fill me-1" style={{color: '#f8ce0b'}}></i>
                  <i className="bi bi-star-fill me-1" style={{color: '#f8ce0b'}}></i>
                  <i className="bi bi-star-fill me-1" style={{color: '#f8ce0b'}}></i>
                  <i className="bi bi-star-half me-1" style={{color: '#f8ce0b'}}></i>
                  <span className="ms-1">4.8 (25 reviews)</span>
                </div>
              </div>
              <hr />
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  as={Link} 
                  to="/provider-profile"
                  style={{backgroundColor: theme.colors.primary.main, borderColor: theme.colors.primary.main}}
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit My Profile
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="d-flex justify-content-between align-items-center" style={{backgroundColor: theme.colors.background.light}}>
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bi bi-calendar2-week me-2"></i>
                Appointment Requests
              </h5>
              <Badge bg="danger" pill>3 New</Badge>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <div>
                    <h6 className="mb-0">Emily's Pet Checkup</h6>
                    <small className="text-muted">Regular Dog Checkup • 2 pets</small>
                  </div>
                  <Badge bg="warning" text="dark">Pending</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small><i className="bi bi-clock me-1"></i> Nov 28, 2023 • 10:00 AM</small>
                  <small><i className="bi bi-geo-alt me-1"></i> 2.5 miles away</small>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <div>
                    <h6 className="mb-0">Tom's Cat Vaccination</h6>
                    <small className="text-muted">Cat Vaccination • 1 pet</small>
                  </div>
                  <Badge bg="warning" text="dark">Pending</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small><i className="bi bi-clock me-1"></i> Nov 29, 2023 • 3:30 PM</small>
                  <small><i className="bi bi-geo-alt me-1"></i> 4.1 miles away</small>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <div>
                    <h6 className="mb-0">Jake's Horse Dental</h6>
                    <small className="text-muted">Equine Dental Care • 1 animal</small>
                  </div>
                  <Badge bg="warning" text="dark">Pending</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small><i className="bi bi-clock me-1"></i> Dec 1, 2023 • 1:00 PM</small>
                  <small><i className="bi bi-geo-alt me-1"></i> 7.3 miles away</small>
                </div>
              </div>
              
              <hr />
              
              <div className="d-grid">
                <Button 
                  variant="outline-primary" 
                  as={Link} 
                  to="/provider-appointments"
                  style={{borderColor: theme.colors.primary.main, color: theme.colors.primary.main}}
                >
                  <i className="bi bi-list-ul me-2"></i>
                  View All Appointments
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="d-flex justify-content-between align-items-center" style={{backgroundColor: theme.colors.background.light}}>
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bi bi-clock-history me-2"></i>
                Upcoming Schedule
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Client</th>
                      <th>Service</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Nov 27, 2023 • 9:00 AM</td>
                      <td>Robert Adams</td>
                      <td>Dog Wellness Check</td>
                      <td>Oakland Hills</td>
                      <td><Badge bg="success">Confirmed</Badge></td>
                      <td>
                        <Button size="sm" variant="outline-primary" className="me-1">
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button size="sm" variant="outline-danger">
                          <i className="bi bi-calendar-x"></i>
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>Nov 27, 2023 • 2:30 PM</td>
                      <td>Lisa Mendez</td>
                      <td>Cat Vaccination</td>
                      <td>Brookfield</td>
                      <td><Badge bg="success">Confirmed</Badge></td>
                      <td>
                        <Button size="sm" variant="outline-primary" className="me-1">
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button size="sm" variant="outline-danger">
                          <i className="bi bi-calendar-x"></i>
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>Nov 28, 2023 • 10:00 AM</td>
                      <td>Emily Thompson</td>
                      <td>Dog Checkup</td>
                      <td>Westview</td>
                      <td><Badge bg="warning" text="dark">Pending</Badge></td>
                      <td>
                        <Button size="sm" variant="outline-primary" className="me-1">
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button size="sm" variant="outline-success" className="me-1">
                          <i className="bi bi-check-lg"></i>
                        </Button>
                        <Button size="sm" variant="outline-danger">
                          <i className="bi bi-x-lg"></i>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderClinicDashboard = () => (
    <Row>
      <Col md={8} className="mx-auto">
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center">
            <div className="mb-4">
              <i className="bi bi-building" style={{fontSize: '3rem', color: theme.colors.primary.main}}></i>
            </div>
            <h4>Clinic Dashboard</h4>
            <p>Clinic-specific features are coming soon.</p>
            <Button 
              variant="outline-primary" 
              disabled
              style={{borderColor: theme.colors.primary.main, color: theme.colors.primary.main}}
            >
              <i className="bi bi-tools me-2"></i>
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
        <Spinner animation="border" role="status" style={{color: theme.colors.primary.main}}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{color: theme.colors.primary.dark}}>Welcome Back, {user?.name || user?.email?.split('@')[0] || 'Vet Provider'}</h2>
          <p className="text-muted mb-0">
            Here's an overview of your VisitingVet activity
          </p>
        </div>
        <Button 
          variant="outline-danger" 
          onClick={handleLogout}
          className="d-flex align-items-center"
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {user && (
        <>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p className="mb-1">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="mb-1">
                    <strong>Account Type:</strong> {user.role === 'MVSProvider' ? 'Visiting Vet Provider' : user.role}
                  </p>
                </Col>
                <Col md={6} className="text-md-end">
                  <p className="mb-1">
                    <strong>Last Login:</strong> Today, 9:42 AM
                  </p>
                  <p className="mb-1">
                    <strong>Account Status:</strong> <Badge bg="success">Active</Badge>
                  </p>
                </Col>
              </Row>
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