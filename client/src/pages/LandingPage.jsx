import React from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Search, Check2Circle, Shield, Clock, Award, 
  People, ArrowRight, Star, GeoAlt, Calendar3, 
  CardChecklist, HeartPulse, TelephonePlus
} from 'react-bootstrap-icons';
import theme from '../utils/theme';
import './LandingPage.css'; // Import the CSS file

// Import images for hero section background
// Note: You'll need to add these images to your assets folder
// The paths below assume you'll create these directories and add appropriate images

// Update image fallback URLs with veterinary-themed images
const heroVetImage = "https://images.unsplash.com/photo-1581888227599-779811939961?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
const smallAnimalImage = "https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
const equineImage = "https://images.unsplash.com/photo-1534307980202-7429ecd55b4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
const farmAnimalImage = "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
const ctaBgImage = "https://images.unsplash.com/photo-1551730459-92db2a308d6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section - Modern Design with Animated Content */}
      <section className="hero-section position-relative overflow-hidden">
        <div className="hero-bg-container position-absolute w-100 h-100">
          <div className="hero-bg-overlay position-absolute w-100 h-100"></div>
        </div>
        <Container className="position-relative py-5">
          <Row className="align-items-center min-vh-75">
            <Col lg={7} className="py-5">
              <div className="hero-content fade-in">
                <span className="badge py-2 px-3 mb-3 section-badge-accent">Trusted Veterinary Care</span>
                <h1 className="display-4 fw-bold mb-4">Expert Veterinary Care <br/>At Your Doorstep</h1>
                <p className="lead mb-5 text-white-80">Connect with verified mobile veterinary professionals for all your animals - from household pets to farm animals. Quality care that comes to you.</p>
                <div className="d-flex flex-wrap gap-3">
                  <Button 
                    as={Link} 
                    to="/search-providers" 
                    size="lg"
                    className="btn-primary-gradient"
                  >
                    <Search className="me-2" /> Find a Vet Near You
                  </Button>
                  <Button 
                    as={Link} 
                    to="/register" 
                    variant="outline-light" 
                    size="lg"
                    className="fw-semibold px-4 py-3 border-2"
                  >
                    Join as a Provider
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={5} className="d-none d-lg-block">
              <div className="hero-image-container p-4 fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="hero-image-wrapper">
                  <img 
                    src={heroVetImage}
                    alt="Mobile veterinarian with pet" 
                    className="img-fluid w-100 rounded-3"
                    style={{ maxHeight: '450px', objectFit: 'cover' }}
                    loading="eager"
                  />
                  <div className="stats-card position-absolute">
                    <div className="d-flex align-items-center mb-2">
                      <div className="stats-icon stats-icon-warning">
                        <Star className="text-warning" size={20} />
                      </div>
                      <div>
                        <div className="fs-6 fw-bold">4.9/5.0</div>
                        <div className="text-muted small">Customer Rating</div>
                      </div>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex align-items-center">
                      <div className="stats-icon stats-icon-primary">
                        <Check2Circle className="text-success" size={20} />
                      </div>
                      <div>
                        <div className="fs-6 fw-bold">100+</div>
                        <div className="text-muted small">Verified Providers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section - Card-based with Icons */}
      <section className="py-5 bg-white">
        <Container>
          <div className="text-center mb-5">
            <span className="badge px-3 py-2 mb-2 section-badge-primary">OUR SERVICES</span>
            <h2 className="section-title">Comprehensive Veterinary Services</h2>
            <p className="text-muted section-description">
              From routine checkups to specialized treatments, our mobile veterinary professionals bring a wide range of services directly to you.
            </p>
          </div>
          
          <Row className="g-4">
            {[
              {
                icon: <HeartPulse size={30} className="mb-2 text-secondary" />,
                title: "Small Animal Care",
                description: "Complete care for dogs, cats, and other household pets in the comfort of your home.",
                image: smallAnimalImage,
                link: "/search-providers?animalType=Small%20Animal"
              },
              {
                icon: <GeoAlt size={24} />,
                title: "Equine Services",
                description: "Specialized care for horses including checkups, dental work, and emergency services.",
                image: equineImage,
                link: "/search-providers?animalType=Equine"
              },
              {
                icon: <TelephonePlus size={24} />,
                title: "Farm Animal Care",
                description: "Expert care for farm animals with on-site visits to your farm or ranch.",
                image: farmAnimalImage,
                link: "/search-providers?animalType=Large%20Animal"
              }
            ].map((service, index) => (
              <Col md={4} key={index}>
                <Card className="h-100 border-0 shadow-hover fade-in" 
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                  <div className="position-relative service-image-container" style={{ height: '200px' }}>
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-100 h-100" 
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div className="service-icon position-absolute">
                      {service.icon}
                    </div>
                  </div>
                  <Card.Body className="pt-4">
                    <Card.Title className="fs-5 fw-bold text-primary">{service.title}</Card.Title>
                    <Card.Text className="mb-3 text-muted">
                      {service.description}
                    </Card.Text>
                    <Link 
                      to={service.link}
                      className="learn-more-link"
                    >
                      Learn More <ArrowRight size={14} className="ms-1" />
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* How It Works Section - Timeline Style */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <span className="badge px-3 py-2 mb-2 section-badge-secondary">SIMPLE PROCESS</span>
            <h2 className="section-title">How It Works</h2>
            <p className="text-muted section-description">
              Getting quality veterinary care for your animals has never been easier with our simple three-step process.
            </p>
          </div>
          
          <div className="how-it-works-timeline position-relative">
            {/* Vertical line for desktop */}
            <div className="d-none d-md-block position-absolute" style={{
              width: '2px',
              backgroundColor: `${theme.colors.primary.main}30`,
              top: '20px',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1
            }}></div>
            
            <Row className="g-5">
              {[
                {
                  icon: <Search size={28} />,
                  title: "Search & Find",
                  description: "Browse qualified veterinary providers that specialize in your animal's needs in your area.",
                  color: theme.colors.primary.main
                },
                {
                  icon: <Calendar3 size={28} />,
                  title: "Book an Appointment",
                  description: "Schedule a convenient time for the veterinarian to visit your location.",
                  color: theme.colors.secondary.main
                },
                {
                  icon: <CardChecklist size={28} />,
                  title: "Receive Quality Care",
                  description: "Get professional veterinary services delivered directly to your doorstep.",
                  color: theme.colors.accent.gold
                }
              ].map((step, index) => (
                <Col md={4} key={index} className="mb-md-0 mb-4">
                  <div className="text-center fade-in" style={{ 
                    animationDelay: `${0.2 * (index + 1)}s`,
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <div className="step-number position-relative mb-4">
                      <div style={{ 
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: `${step.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        position: 'relative'
                      }}>
                        <div style={{ 
                          backgroundColor: step.color,
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          {step.icon}
                        </div>
                        <div className="step-number-badge position-absolute" style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          border: `2px solid ${step.color}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          top: 0,
                          right: 0,
                          color: step.color,
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          {index + 1}
                        </div>
                      </div>
                    </div>
                    <h4 className="fw-bold mb-3" style={{ color: step.color }}>{step.title}</h4>
                    <p className="text-muted mb-0">{step.description}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
          
          <div className="text-center mt-5">
            <Button 
              as={Link} 
              to="/search-providers"
              size="lg"
              className="btn-primary-gradient px-4 py-3"
            >
              Find a Veterinarian Now <ArrowRight className="ms-2" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Testimonials Section - Modern Carousel */}
      <section className="py-5 position-relative overflow-hidden">
        <Container>
          <div className="text-center mb-5">
            <span className="badge px-3 py-2 mb-2 section-badge-accent">TESTIMONIALS</span>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="text-muted section-description">
              Hear from pet owners and farmers who have experienced the convenience and quality of our mobile veterinary services.
            </p>
          </div>
          
          <Carousel 
            fade
            indicators={false}
            interval={5000}
            className="testimonial-carousel py-3"
            prevIcon={<span aria-hidden="true" className="carousel-control-icon prev" />}
            nextIcon={<span aria-hidden="true" className="carousel-control-icon next" />}
          >
            {[
              {
                image: "https://randomuser.me/api/portraits/women/54.jpg",
                text: "Having a vet come to our farm has been a game-changer. Our cattle receive prompt care without the stress of transportation. The scheduling system is seamless!",
                name: "Sarah Johnson",
                role: "Cattle Farmer"
              },
              {
                image: "https://randomuser.me/api/portraits/men/32.jpg",
                text: "As a small animal veterinarian, this platform has helped me connect with more clients and manage my schedule efficiently. The support team is always helpful.",
                name: "Dr. Michael Chen",
                role: "Small Animal Veterinarian"
              },
              {
                image: "https://randomuser.me/api/portraits/women/28.jpg",
                text: "My elderly cat gets anxious at clinics, so having a vet come to us has been wonderful. The booking process was easy and the vet was professional and caring.",
                name: "Lisa Martinez",
                role: "Pet Owner"
              }
            ].map((testimonial, index) => (
              <Carousel.Item key={index}>
                <div className="testimonial-container py-4">
                  <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                      <Card className="border-0 shadow-lg" style={{
                        borderRadius: theme.borderRadius.lg,
                        overflow: 'hidden'
                      }}>
                        <Card.Body className="p-0">
                          <Row className="g-0">
                            <Col md={4} className="d-none d-md-block" style={{
                              backgroundColor: theme.colors.primary.main,
                              position: 'relative'
                            }}>
                              <div className="testimonial-quote-icon position-absolute" style={{
                                top: '30px',
                                left: '30px',
                                opacity: 0.2,
                                color: 'white',
                                fontSize: '4rem'
                              }}>
                                "
                              </div>
                              <div className="d-flex flex-column justify-content-center align-items-center h-100 p-4">
                                <div className="testimonial-image mb-3" style={{
                                  width: '100px',
                                  height: '100px',
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  border: '3px solid white'
                                }}>
                                  <img 
                                    src={testimonial.image} 
                                    alt={testimonial.name}
                                    className="w-100 h-100"
                                    style={{ objectFit: 'cover' }}
                                  />
                                </div>
                                <h5 className="text-white mb-1">{testimonial.name}</h5>
                                <p className="text-white-50 mb-0 small">{testimonial.role}</p>
                              </div>
                            </Col>
                            <Col md={8}>
                              <div className="p-4 p-md-5 d-flex flex-column justify-content-center h-100">
                                <div className="d-md-none d-flex align-items-center mb-4">
                                  <img 
                                    src={testimonial.image} 
                                    alt={testimonial.name}
                                    className="rounded-circle me-3"
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                  />
                                  <div>
                                    <h5 className="mb-0">{testimonial.name}</h5>
                                    <p className="text-muted mb-0 small">{testimonial.role}</p>
                                  </div>
                                </div>
                                <div className="mb-4">
                                  <Star className="text-warning me-1" />
                                  <Star className="text-warning me-1" />
                                  <Star className="text-warning me-1" />
                                  <Star className="text-warning me-1" />
                                  <Star className="text-warning" />
                                </div>
                                <p className="testimonial-text mb-0 fs-5">"{testimonial.text}"</p>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section py-5 position-relative" style={{
        background: `linear-gradient(rgba(18, 68, 56, 0.9), rgba(87, 126, 70, 0.9)), url("${ctaBgImage}") no-repeat center center/cover`,
        padding: '80px 0',
      }}>
        <Container className="text-center text-white">
          <Row className="justify-content-center">
            <Col lg={8}>
              <h2 className="fw-bold mb-4">Join Our Growing Network of Veterinary Professionals</h2>
              <p className="lead mb-4">Expand your practice, set your own schedule, and connect with clients who need your expertise</p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button 
                  as={Link} 
                  to="/register" 
                  className="btn-primary-gradient px-4 py-3"
                >
                  Register as Provider <ArrowRight className="ms-2" />
                </Button>
                <Button 
                  as={Link} 
                  to="/about-providers" 
                  variant="outline-light" 
                  size="lg"
                  className="fw-semibold px-4 py-3"
                >
                  Learn More
                </Button>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Decorative elements */}
        <div className="position-absolute" style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          top: '-100px',
          left: '-100px'
        }}></div>
        <div className="position-absolute" style={{
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          bottom: '-150px',
          right: '-150px'
        }}></div>
      </section>
    </div>
  );
};

export default LandingPage; 