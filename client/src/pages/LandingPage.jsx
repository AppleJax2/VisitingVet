import React from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Search, Check2Circle, Shield, Clock, Award, People, ArrowRight } from 'react-bootstrap-icons';
import theme from '../utils/theme';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section" style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80") no-repeat center center/cover`,
      }}>
        <Container>
          <div className="text-center py-5 fade-in">
            <h1 className="display-4 fw-bold mb-4">Quality Veterinary Care That Comes To You</h1>
            <p className="lead mb-5">Connect with trusted mobile veterinary services for all your animals - from pets to farm animals.</p>
            <div className="d-flex justify-content-center gap-3">
              <Button 
                as={Link} 
                to="/search-providers" 
                className="btn-lg"
                style={{
                  backgroundColor: theme.colors.secondary.main,
                  borderColor: theme.colors.secondary.main,
                  color: theme.colors.text.white,
                  fontWeight: 'bold',
                }}
              >
                Find a Vet
              </Button>
              <Button 
                as={Link} 
                to="/register" 
                variant="outline-light" 
                className="btn-lg"
              >
                Join as a Provider
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Service Types Section */}
      <section className="py-5" style={{ backgroundColor: theme.colors.background.light }}>
        <Container>
          <h2 className="text-center mb-5" style={{ color: theme.colors.primary.dark }}>Veterinary Services For All Animals</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0 fade-in" style={{ animationDelay: '0.1s' }}>
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1536590158209-e9d94d14c4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" />
                <Card.Body className="text-center">
                  <Card.Title style={{ color: theme.colors.primary.main }}>Small Animal Care</Card.Title>
                  <Card.Text>
                    Comprehensive care for dogs, cats, rabbits, ferrets, and other household pets in the comfort of your home.
                  </Card.Text>
                  <Button 
                    as={Link} 
                    to="/search-providers?animalType=Small%20Animal"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: theme.colors.primary.main,
                      color: theme.colors.primary.main,
                    }}
                    className="mt-2"
                  >
                    Find Small Animal Vets
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0 fade-in" style={{ animationDelay: '0.2s' }}>
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" />
                <Card.Body className="text-center">
                  <Card.Title style={{ color: theme.colors.primary.main }}>Equine Services</Card.Title>
                  <Card.Text>
                    Specialized care for horses including routine check-ups, dental work, vaccinations, and emergency services.
                  </Card.Text>
                  <Button 
                    as={Link} 
                    to="/search-providers?animalType=Equine"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: theme.colors.primary.main,
                      color: theme.colors.primary.main,
                    }}
                    className="mt-2"
                  >
                    Find Equine Vets
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0 fade-in" style={{ animationDelay: '0.3s' }}>
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" />
                <Card.Body className="text-center">
                  <Card.Title style={{ color: theme.colors.primary.main }}>Farm & Large Animal Care</Card.Title>
                  <Card.Text>
                    Expert care for cattle, sheep, goats, pigs, and other farm animals with on-site visits to your farm or ranch.
                  </Card.Text>
                  <Button 
                    as={Link} 
                    to="/search-providers?animalType=Large%20Animal"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: theme.colors.primary.main,
                      color: theme.colors.primary.main,
                    }}
                    className="mt-2"
                  >
                    Find Farm Animal Vets
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Specialty Services Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-2" style={{ color: theme.colors.primary.dark }}>Specialty Services</h2>
          <p className="text-center text-muted mb-5">Discover providers offering specialized veterinary services</p>
          <Row className="g-4">
            <Col md={3}>
              <Card className="text-center h-100 shadow-sm border-0 fade-in" style={{ animationDelay: '0.1s' }}>
                <Card.Body>
                  <div className="icon-wrapper mb-3">
                    <div 
                      style={{ 
                        backgroundColor: theme.colors.background.light,
                        borderRadius: '50%',
                        width: '70px',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                      }}
                    >
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/2138/2138441.png" 
                        alt="Farrier Services" 
                        style={{ height: '40px', width: '40px' }}
                      />
                    </div>
                  </div>
                  <Card.Title style={{ color: theme.colors.primary.main }}>Farrier Services</Card.Title>
                  <Card.Text>
                    Professional hoof care and horseshoeing by experienced farriers.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100 shadow-sm border-0 fade-in" style={{ animationDelay: '0.2s' }}>
                <Card.Body>
                  <div className="icon-wrapper mb-3">
                    <div 
                      style={{ 
                        backgroundColor: theme.colors.background.light,
                        borderRadius: '50%',
                        width: '70px',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                      }}
                    >
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/2332/2332039.png" 
                        alt="Dental Care" 
                        style={{ height: '40px', width: '40px' }}
                      />
                    </div>
                  </div>
                  <Card.Title style={{ color: theme.colors.primary.main }}>Dental Care</Card.Title>
                  <Card.Text>
                    Specialized dental services for all animals to maintain oral health.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100 shadow-sm border-0 fade-in" style={{ animationDelay: '0.3s' }}>
                <Card.Body>
                  <div className="icon-wrapper mb-3">
                    <div 
                      style={{ 
                        backgroundColor: theme.colors.background.light,
                        borderRadius: '50%',
                        width: '70px',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                      }}
                    >
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/2447/2447774.png" 
                        alt="Mobile Diagnostics" 
                        style={{ height: '40px', width: '40px' }}
                      />
                    </div>
                  </div>
                  <Card.Title style={{ color: theme.colors.primary.main }}>Mobile Diagnostics</Card.Title>
                  <Card.Text>
                    Advanced diagnostic services including ultrasound and X-ray at your location.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100 shadow-sm border-0 fade-in" style={{ animationDelay: '0.4s' }}>
                <Card.Body>
                  <div className="icon-wrapper mb-3">
                    <div 
                      style={{ 
                        backgroundColor: theme.colors.background.light,
                        borderRadius: '50%',
                        width: '70px',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                      }}
                    >
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/3588/3588552.png" 
                        alt="Reproductive Services" 
                        style={{ height: '40px', width: '40px' }}
                      />
                    </div>
                  </div>
                  <Card.Title style={{ color: theme.colors.primary.main }}>Reproductive Services</Card.Title>
                  <Card.Text>
                    Breeding management, artificial insemination, and reproductive health care.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <div className="text-center mt-4">
            <Button 
              as={Link} 
              to="/search-providers"
              style={{
                backgroundColor: theme.colors.secondary.main,
                borderColor: theme.colors.secondary.main,
              }}
              className="mt-3"
            >
              Browse All Services <ArrowRight className="ms-1" />
            </Button>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-5" style={{ backgroundColor: theme.colors.background.tan }}>
        <Container>
          <h2 className="text-center mb-5" style={{ color: theme.colors.primary.dark }}>How It Works</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="text-center fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="icon-wrapper mb-3">
                  <div 
                    style={{ 
                      backgroundColor: theme.colors.accent.lightGreen,
                      borderRadius: '50%',
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}
                  >
                    <Search size={40} style={{ color: theme.colors.primary.dark }} />
                  </div>
                </div>
                <h4 style={{ color: theme.colors.primary.main }}>Search</h4>
                <p>Find qualified veterinary providers that specialize in your animal's needs and serve your area.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="icon-wrapper mb-3">
                  <div 
                    style={{ 
                      backgroundColor: theme.colors.accent.lightGreen,
                      borderRadius: '50%',
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}
                  >
                    <Clock size={40} style={{ color: theme.colors.primary.dark }} />
                  </div>
                </div>
                <h4 style={{ color: theme.colors.primary.main }}>Book</h4>
                <p>Schedule an appointment at a time that's convenient for you and your animals.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="icon-wrapper mb-3">
                  <div 
                    style={{ 
                      backgroundColor: theme.colors.accent.lightGreen,
                      borderRadius: '50%',
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}
                  >
                    <Check2Circle size={40} style={{ color: theme.colors.primary.dark }} />
                  </div>
                </div>
                <h4 style={{ color: theme.colors.primary.main }}>Receive Care</h4>
                <p>Get quality veterinary care delivered directly to your home, farm, or ranch.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5" style={{ color: theme.colors.primary.dark }}>What Our Users Say</h2>
          <Carousel 
            variant="dark" 
            indicators={false} 
            className="testimonial-carousel py-3"
            interval={5000}
            style={{
              backgroundColor: theme.colors.background.light,
              borderRadius: theme.borderRadius.lg,
              padding: '20px',
            }}
          >
            <Carousel.Item>
              <div className="testimonial-item text-center px-md-5 px-3 py-3">
                <div className="mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/women/54.jpg"
                    alt="Testimonial"
                    className="rounded-circle"
                    width="100"
                    height="100"
                    style={{ border: `4px solid ${theme.colors.accent.gold}` }}
                  />
                </div>
                <p className="testimonial-text mb-3 fs-5 mx-auto" style={{ maxWidth: '700px' }}>
                  "Having a vet come to our farm has been a game-changer. Our cattle receive prompt care without the stress of transportation. The scheduling system is seamless!"
                </p>
                <h5 className="mb-0" style={{ color: theme.colors.primary.main }}>Sarah Johnson</h5>
                <p className="text-muted">Cattle Farmer</p>
              </div>
            </Carousel.Item>
            <Carousel.Item>
              <div className="testimonial-item text-center px-md-5 px-3 py-3">
                <div className="mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Testimonial"
                    className="rounded-circle"
                    width="100"
                    height="100"
                    style={{ border: `4px solid ${theme.colors.accent.gold}` }}
                  />
                </div>
                <p className="testimonial-text mb-3 fs-5 mx-auto" style={{ maxWidth: '700px' }}>
                  "As a small animal veterinarian, this platform has helped me connect with more clients and manage my schedule efficiently. The support team is always helpful."
                </p>
                <h5 className="mb-0" style={{ color: theme.colors.primary.main }}>Dr. Michael Chen</h5>
                <p className="text-muted">Small Animal Veterinarian</p>
              </div>
            </Carousel.Item>
            <Carousel.Item>
              <div className="testimonial-item text-center px-md-5 px-3 py-3">
                <div className="mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/women/28.jpg"
                    alt="Testimonial"
                    className="rounded-circle"
                    width="100"
                    height="100"
                    style={{ border: `4px solid ${theme.colors.accent.gold}` }}
                  />
                </div>
                <p className="testimonial-text mb-3 fs-5 mx-auto" style={{ maxWidth: '700px' }}>
                  "My elderly cat gets anxious at clinics, so having a vet come to us has been wonderful. The booking process was easy and the vet was professional and caring."
                </p>
                <h5 className="mb-0" style={{ color: theme.colors.primary.main }}>Lisa Martinez</h5>
                <p className="text-muted">Pet Owner</p>
              </div>
            </Carousel.Item>
          </Carousel>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="py-5 text-center text-white" style={{
        background: `linear-gradient(rgba(18, 68, 56, 0.8), rgba(87, 126, 70, 0.8)), url("https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80") no-repeat center center/cover`,
        padding: '60px 0',
      }}>
        <Container>
          <h2 className="mb-4">Join Our Network of Veterinary Professionals</h2>
          <p className="lead mb-4">Expand your practice, set your own schedule, and connect with clients who need your expertise</p>
          <Button 
            as={Link} 
            to="/register" 
            size="lg"
            style={{
              backgroundColor: theme.colors.secondary.main,
              borderColor: theme.colors.secondary.main,
              color: theme.colors.text.white,
              fontWeight: 'bold',
            }}
          >
            Register as a Provider
          </Button>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="py-5" style={{ backgroundColor: theme.colors.background.light }}>
        <Container>
          <h2 className="text-center mb-5" style={{ color: theme.colors.primary.dark }}>Why Choose VisitingVet</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="d-flex align-items-start mb-4 fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="me-3">
                  <div 
                    style={{ 
                      backgroundColor: theme.colors.accent.lightGreen,
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Shield size={25} style={{ color: theme.colors.primary.dark }} />
                  </div>
                </div>
                <div>
                  <h4 style={{ color: theme.colors.primary.main }}>Verified Professionals</h4>
                  <p className="text-muted">All our veterinary providers go through a verification process to ensure quality care.</p>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-start mb-4 fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="me-3">
                  <div 
                    style={{ 
                      backgroundColor: theme.colors.accent.lightGreen,
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <People size={25} style={{ color: theme.colors.primary.dark }} />
                  </div>
                </div>
                <div>
                  <h4 style={{ color: theme.colors.primary.main }}>For All Animals</h4>
                  <p className="text-muted">From household pets to large farm animals, we connect you with the right specialist.</p>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-start mb-4 fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="me-3">
                  <div 
                    style={{ 
                      backgroundColor: theme.colors.accent.lightGreen,
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Award size={25} style={{ color: theme.colors.primary.dark }} />
                  </div>
                </div>
                <div>
                  <h4 style={{ color: theme.colors.primary.main }}>Specialized Care</h4>
                  <p className="text-muted">Access to specialists like farriers, equine dentists, and large animal surgeons.</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage; 