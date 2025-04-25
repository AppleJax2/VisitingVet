import React from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Search, Check2Circle, Shield, Clock, Award, People } from 'react-bootstrap-icons';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section py-5 text-center text-white" style={{
        background: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80") no-repeat center center/cover',
        padding: '100px 0'
      }}>
        <Container>
          <h1 className="display-4 fw-bold mb-4">Quality Veterinary Care That Comes To You</h1>
          <p className="lead mb-5">Connect with trusted mobile veterinary services for all your animals - from pets to farm animals.</p>
          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/search-providers" variant="primary" size="lg">
              Find a Vet
            </Button>
            <Button as={Link} to="/register" variant="outline-light" size="lg">
              Join as a Provider
            </Button>
          </div>
        </Container>
      </section>

      {/* Service Types Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Veterinary Services For All Animals</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1536590158209-e9d94d14c4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" />
                <Card.Body className="text-center">
                  <Card.Title>Small Animal Care</Card.Title>
                  <Card.Text>
                    Comprehensive care for dogs, cats, rabbits, ferrets, and other household pets in the comfort of your home.
                  </Card.Text>
                  <Button as={Link} to="/search-providers?animalType=Small%20Animal" variant="outline-primary">Find Small Animal Vets</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" />
                <Card.Body className="text-center">
                  <Card.Title>Equine Services</Card.Title>
                  <Card.Text>
                    Specialized care for horses including routine check-ups, dental work, vaccinations, and emergency services.
                  </Card.Text>
                  <Button as={Link} to="/search-providers?animalType=Equine" variant="outline-primary">Find Equine Vets</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" />
                <Card.Body className="text-center">
                  <Card.Title>Farm & Large Animal Care</Card.Title>
                  <Card.Text>
                    Expert care for cattle, sheep, goats, pigs, and other farm animals with on-site visits to your farm or ranch.
                  </Card.Text>
                  <Button as={Link} to="/search-providers?animalType=Large%20Animal" variant="outline-primary">Find Farm Animal Vets</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Specialty Services Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-2">Specialty Services</h2>
          <p className="text-center text-muted mb-5">Discover providers offering specialized veterinary services</p>
          <Row className="g-4">
            <Col md={3}>
              <Card className="text-center h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="icon-wrapper mb-3">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/2138/2138441.png" 
                      alt="Farrier Services" 
                      style={{ height: '50px', width: '50px' }}
                    />
                  </div>
                  <Card.Title>Farrier Services</Card.Title>
                  <Card.Text>
                    Professional hoof care and horseshoeing by experienced farriers.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="icon-wrapper mb-3">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/2332/2332039.png" 
                      alt="Dental Care" 
                      style={{ height: '50px', width: '50px' }}
                    />
                  </div>
                  <Card.Title>Dental Care</Card.Title>
                  <Card.Text>
                    Specialized dental services for all animals to maintain oral health.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="icon-wrapper mb-3">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/2447/2447774.png" 
                      alt="Mobile Diagnostics" 
                      style={{ height: '50px', width: '50px' }}
                    />
                  </div>
                  <Card.Title>Mobile Diagnostics</Card.Title>
                  <Card.Text>
                    Advanced diagnostic services including ultrasound and X-ray at your location.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="icon-wrapper mb-3">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/3588/3588552.png" 
                      alt="Reproductive Services" 
                      style={{ height: '50px', width: '50px' }}
                    />
                  </div>
                  <Card.Title>Reproductive Services</Card.Title>
                  <Card.Text>
                    Breeding management, artificial insemination, and reproductive health care.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <div className="text-center mt-4">
            <Button as={Link} to="/search-providers" variant="primary">
              Browse All Services
            </Button>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">How It Works</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="text-center">
                <div className="icon-wrapper mb-3">
                  <Search size={50} className="text-primary" />
                </div>
                <h4>Search</h4>
                <p>Find qualified veterinary providers that specialize in your animal's needs and serve your area.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <div className="icon-wrapper mb-3">
                  <Clock size={50} className="text-primary" />
                </div>
                <h4>Book</h4>
                <p>Schedule an appointment at a time that's convenient for you and your animals.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <div className="icon-wrapper mb-3">
                  <Check2Circle size={50} className="text-primary" />
                </div>
                <h4>Receive Care</h4>
                <p>Get quality veterinary care delivered directly to your home, farm, or ranch.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5">What Our Users Say</h2>
          <Carousel variant="dark" indicators={false} className="testimonial-carousel">
            <Carousel.Item>
              <div className="testimonial-item text-center px-5">
                <div className="mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/women/54.jpg"
                    alt="Testimonial"
                    className="rounded-circle"
                    width="80"
                    height="80"
                  />
                </div>
                <p className="testimonial-text mb-3">"Having a vet come to our farm has been a game-changer. Our cattle receive prompt care without the stress of transportation. The scheduling system is seamless!"</p>
                <h5 className="mb-0">Sarah Johnson</h5>
                <p className="text-muted">Cattle Farmer</p>
              </div>
            </Carousel.Item>
            <Carousel.Item>
              <div className="testimonial-item text-center px-5">
                <div className="mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Testimonial"
                    className="rounded-circle"
                    width="80"
                    height="80"
                  />
                </div>
                <p className="testimonial-text mb-3">"As a small animal veterinarian, this platform has helped me connect with more clients and manage my schedule efficiently. The support team is always helpful."</p>
                <h5 className="mb-0">Dr. Michael Chen</h5>
                <p className="text-muted">Small Animal Veterinarian</p>
              </div>
            </Carousel.Item>
            <Carousel.Item>
              <div className="testimonial-item text-center px-5">
                <div className="mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/women/28.jpg"
                    alt="Testimonial"
                    className="rounded-circle"
                    width="80"
                    height="80"
                  />
                </div>
                <p className="testimonial-text mb-3">"My elderly cat gets anxious at clinics, so having a vet come to us has been wonderful. The booking process was easy and the vet was professional and caring."</p>
                <h5 className="mb-0">Lisa Martinez</h5>
                <p className="text-muted">Pet Owner</p>
              </div>
            </Carousel.Item>
          </Carousel>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="py-5 text-center text-white" style={{
        background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80") no-repeat center center/cover',
      }}>
        <Container>
          <h2 className="mb-4">Join Our Network of Veterinary Professionals</h2>
          <p className="lead mb-4">Expand your practice, set your own schedule, and connect with clients who need your expertise</p>
          <Button as={Link} to="/register" variant="primary" size="lg">
            Register as a Provider
          </Button>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Why Choose VisitingVet</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="d-flex align-items-start mb-4">
                <div className="me-3">
                  <Shield size={30} className="text-primary" />
                </div>
                <div>
                  <h4>Verified Professionals</h4>
                  <p className="text-muted">All our veterinary providers go through a verification process to ensure quality care.</p>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-start mb-4">
                <div className="me-3">
                  <People size={30} className="text-primary" />
                </div>
                <div>
                  <h4>For All Animals</h4>
                  <p className="text-muted">From household pets to large farm animals, we connect you with the right specialist.</p>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-start mb-4">
                <div className="me-3">
                  <Award size={30} className="text-primary" />
                </div>
                <div>
                  <h4>Specialized Care</h4>
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