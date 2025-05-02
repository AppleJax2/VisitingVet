import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup, Alert, Spinner, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { getProfileById, getProviderAvailability, checkAuthStatus } from '../services/api';
import api from '../services/api';
import AppointmentRequestModal from '../components/AppointmentRequestModal';
import ReviewList from '../components/Reviews/ReviewList';
import StarRatingDisplay from '../components/Reviews/StarRatingDisplay';

function ProviderProfileViewPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setIsLoading(true);
      setError('');
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        // Check current user role (if logged in)
        const authData = await checkAuthStatus();
        if (authData && authData.success) {
          setCurrentUserRole(authData.user.role);
        }
        
        // Fetch provider profile
        const profileData = await getProfileById(id);
        if (profileData && profileData.success) {
          setProfile(profileData.profile);
          setUser(profileData.profile.user);
          setServices(profileData.profile.services || []);
        } else {
            throw new Error(profileData.message || 'Profile not found');
        }

        // Fetch reviews for this profile
        try {
            const reviewsData = await api.get(`/reviews/provider/${id}`);
            if (reviewsData.data.success) {
                setReviews(reviewsData.data.data || []);
            } else {
                throw new Error(reviewsData.data.message || 'Failed to load reviews');
            }
        } catch (reviewErr) {
             console.error("Review Fetch Error:", reviewErr);
             setReviewsError(reviewErr.message || 'Could not load reviews for this provider.');
        }

      } catch (err) {
        setError('Failed to load provider profile. The provider may not exist or has not created a profile yet.');
        console.error("Profile Fetch Error:", err);
      } finally {
        setIsLoading(false);
        setReviewsLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [id]);

  const handleRequestAppointment = (service) => {
    if (currentUserRole !== 'PetOwner') {
      // Redirect to login or show message for non-pet owners
      setError('You must be logged in as a pet owner to request appointments.');
      return;
    }
    
    setSelectedService(service);
    setShowAppointmentModal(true);
  };

  const handleCloseModal = () => {
    setShowAppointmentModal(false);
    setSelectedService(null);
  };

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error || 'Provider profile not found'}
        </Alert>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row>
        <Col md={4}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={`${user.email}`}
                  className="img-fluid rounded-circle mb-3 shadow-sm border"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="bg-secondary text-white rounded-circle mb-3 d-flex align-items-center justify-content-center mx-auto shadow-sm border display-1 fw-bold"
                  style={{ width: '150px', height: '150px' }}
                >
                  {user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="h5 fw-bold">{user.email}</h3>
              <p className="text-muted mb-2">Visiting Veterinarian</p>
              
              <div className="mb-2">
                    {profile.numberOfReviews > 0 ? (
                        <>
                            <StarRatingDisplay rating={profile.averageRating} /> 
                            <span className="ms-2 text-muted">({profile.numberOfReviews} review{profile.numberOfReviews !== 1 ? 's' : ''})</span>
                        </>
                    ) : (
                        <span className="text-muted">No reviews yet</span>
                    )}
                </div>
              
              {profile.credentials && profile.credentials.length > 0 && (
                <div className="mb-2">
                  {profile.credentials.map((credential, index) => (
                    <Badge key={index} bg="info" className="me-1">
                      {credential}
                    </Badge>
                  ))}
                </div>
              )}
              
              {profile.yearsExperience && (
                <p>{profile.yearsExperience} years of experience</p>
              )}
            </Card.Body>
          </Card>
          
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Service Area</h5>
            </Card.Header>
            <Card.Body>
              {profile.serviceAreaDescription && (
                <p>{profile.serviceAreaDescription}</p>
              )}
              
              {profile.serviceAreaRadiusKm && (
                <p>
                  <strong>Service Radius:</strong> {profile.serviceAreaRadiusKm} km
                </p>
              )}
              
              {profile.serviceAreaZipCodes && profile.serviceAreaZipCodes.length > 0 && (
                <div>
                  <strong>Service ZIP Codes:</strong>
                  <p>{profile.serviceAreaZipCodes.join(', ')}</p>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {profile.clinicAffiliations && profile.clinicAffiliations.length > 0 && (
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Affiliated With</h5>
              </Card.Header>
              <ListGroup variant="flush">
                {profile.clinicAffiliations.map((clinic, index) => (
                  <ListGroup.Item key={index}>{clinic}</ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>
        
        <Col md={8}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h4 className="mb-0">About</h4>
            </Card.Header>
            <Card.Body>
              <p>{profile.bio}</p>
            </Card.Body>
          </Card>
          
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h4 className="mb-0">Services Offered</h4>
            </Card.Header>
            <Card.Body>
              {services.length === 0 ? (
                <Alert variant="info">
                  This provider hasn't added any services yet.
                </Alert>
              ) : (
                <Row>
                  {services.map((service) => (
                    <Col md={6} key={service._id} className="mb-3 d-flex align-items-stretch">
                      <Card className="border h-100 w-100">
                        <Card.Body className="d-flex flex-column">
                          <div className="flex-grow-1">
                            <Card.Title className="h6 fw-bold">{service.name}</Card.Title>
                            <Card.Text>{service.description}</Card.Text>
                            <div className="d-flex justify-content-between small text-muted mb-2">
                              <span>
                                <strong>Duration:</strong> {service.estimatedDurationMinutes} mins
                              </span>
                              <span>
                                <strong>Price:</strong> ${service.price} ({service.priceType})
                              </span>
                            </div>
                          </div>
                          <div className="mt-auto d-flex justify-content-between align-items-center">
                            <Badge pill bg={
                              service.offeredLocation === 'InHome' ? 'success' :
                              service.offeredLocation === 'InClinic' ? 'primary' : 'warning'
                            }>
                              {service.offeredLocation === 'InHome' ? 'In-Home' :
                               service.offeredLocation === 'InClinic' ? 'In-Clinic' : 'In-Home & In-Clinic'}
                            </Badge>
                            
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => handleRequestAppointment(service)}
                              disabled={currentUserRole !== 'PetOwner'}
                            >
                              Request Appointment
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
              
              {currentUserRole !== 'PetOwner' && services.length > 0 && (
                <Alert variant="info" className="mt-3">
                  You need to be logged in as a pet owner to request appointments.
                  {!currentUserRole && (
                    <div className="mt-2">
                      <Link to="/login" className="btn btn-primary btn-sm">
                        Log In
                      </Link>{' '}
                      <Link to="/register" className="btn btn-outline-primary btn-sm">
                        Register
                      </Link>
                    </div>
                  )}
                </Alert>
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h4 className="mb-0">Reviews ({profile.numberOfReviews || 0})</h4>
            </Card.Header>
            <Card.Body>
               <ReviewList 
                    reviews={reviews}
                    isLoading={reviewsLoading}
                    error={reviewsError}
                />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Appointment Request Modal */}
      <AppointmentRequestModal
        show={showAppointmentModal}
        onHide={handleCloseModal}
        service={selectedService}
        providerProfileId={id}
      />
    </Container>
  );
}

export default ProviderProfileViewPage; 