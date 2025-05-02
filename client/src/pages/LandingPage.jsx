import React, { useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Search, Check2Circle, Shield, Clock, Award, 
  People, ArrowRight, Star, GeoAlt, Calendar3, 
  CardChecklist, HeartPulse, TelephonePlus
} from 'react-bootstrap-icons';

// Update image fallback URLs with WebP format and fallbacks
const heroVetImage = {
  webp: "/assets/images/landing-page/hero-vet.webp",
  fallback: "/assets/images/landing-page/hero-vet.jpg"
};
const smallAnimalImage = {
  webp: "/assets/images/landing-page/small-animal.webp",
  fallback: "/assets/images/landing-page/small-animal.jpg"
};
const equineImage = {
  webp: "/assets/images/landing-page/equine.webp",
  fallback: "/assets/images/landing-page/equine.jpg"
};
const farmAnimalImage = {
  webp: "/assets/images/landing-page/farm-animal.webp",
  fallback: "/assets/images/landing-page/farm-animal.jpg"
};
const ctaBgImage = {
  webp: "/assets/images/landing-page/cta-bg.webp",
  fallback: "/assets/images/landing-page/cta-bg.jpg"
};

const LandingPage = () => {
  const mainContentRef = useRef(null);

  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-fade-in');
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <a href="#main-content" className="visually-hidden-focusable">Skip to main content</a>
      {/* Hero Section - Modern Design with Animated Content */}
      <header 
        className="position-relative overflow-hidden text-white p-5 text-center bg-dark" 
        role="banner" 
        tabIndex="-1" 
        aria-labelledby="hero-heading" 
        style={{ 
          background: `linear-gradient(rgba(18, 68, 56, 0.7), rgba(87, 126, 70, 0.7)), url(${heroVetImage.fallback}) no-repeat center center`, 
          backgroundSize: 'cover',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="scroll-fade-in">
              <Badge bg="info" className="py-2 px-3 mb-3">Trusted Veterinary Care</Badge>
              <h1 id="hero-heading" className="display-4 fw-bold mb-4">Expert Veterinary Care <br/>At Your Doorstep</h1>
              <p className="lead mb-5 text-white-80">Connect with verified mobile veterinary professionals for all your animals - from household pets to farm animals. Quality care that comes to you.</p>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <Button 
                  as={Link} 
                  to="/search-providers" 
                  variant="primary"
                  size="lg"
                  aria-label="Find a veterinarian near you"
                >
                  <Search className="me-2" aria-hidden="true" /> Find a Vet Near You
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="outline-light" 
                  size="lg"
                  className="fw-semibold"
                  aria-label="Register as a veterinary provider"
                >
                  Join as a Provider
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </header>

      <main id="main-content" ref={mainContentRef} role="main">
        {/* Features Section - Card-based with Icons */}
        <section className="py-5 bg-white scroll-fade-in" role="region" aria-labelledby="features-heading">
          <Container>
            <div className="text-center mb-5">
              <Badge bg="primary" className="px-3 py-2 mb-2">OUR SERVICES</Badge>
              <h2 id="features-heading" className="fw-bold mb-3">Comprehensive Veterinary Services</h2>
              <p className="text-muted mx-auto" style={{ maxWidth: '800px' }}>
                From routine checkups to specialized treatments, our mobile veterinary professionals bring a wide range of services directly to you.
              </p>
            </div>
            
            <Row className="g-4">
              {[
                {
                  icon: <HeartPulse size={30} className="mb-3 text-primary" />,
                  title: "Small Animal Care",
                  description: "Complete care for dogs, cats, and other household pets in the comfort of your home.",
                  image: smallAnimalImage,
                  link: "/search-providers?animalType=Small%20Animal"
                },
                {
                  icon: <GeoAlt size={30} className="mb-3 text-secondary" />,
                  title: "Equine Services",
                  description: "Specialized care for horses including checkups, dental work, and emergency services.",
                  image: equineImage,
                  link: "/search-providers?animalType=Equine"
                },
                {
                  icon: <TelephonePlus size={30} className="mb-3 text-success" />,
                  title: "Farm Animal Care",
                  description: "Expert care for farm animals with on-site visits to your farm or ranch.",
                  image: farmAnimalImage,
                  link: "/search-providers?animalType=Large%20Animal"
                }
              ].map((service, index) => (
                <Col md={4} key={index}>
                  <Card className="h-100 border-0 shadow-sm text-center">
                    <Card.Img variant="top" src={service.image.fallback} alt={service.title} style={{ height: '200px', objectFit: 'cover' }} loading="lazy" />
                    <Card.Body className="d-flex flex-column">
                      <div>{service.icon}</div>
                      <Card.Title as="h3" id={`service-title-${index}`} className="fs-5 fw-bold mb-3">{service.title}</Card.Title>
                      <Card.Text className="text-muted mb-3">
                        {service.description}
                      </Card.Text>
                      <Button 
                        as={Link} 
                        to={service.link}
                        variant="outline-primary" 
                        className="mt-auto align-self-center"
                        aria-label={`Learn more about ${service.title}`}
                      >
                        Learn More <ArrowRight size={14} className="ms-1" aria-hidden="true" />
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* How It Works Section - Timeline Style */}
        <section className="py-5 bg-light scroll-fade-in" role="region" aria-labelledby="how-it-works-heading">
          <Container>
            <div className="text-center mb-5">
              <Badge bg="secondary" className="px-3 py-2 mb-2">SIMPLE PROCESS</Badge>
              <h2 id="how-it-works-heading" className="fw-bold mb-3">How It Works</h2>
              <p className="text-muted mx-auto" style={{ maxWidth: '800px' }}>
                Getting quality veterinary care for your animals has never been easier with our simple three-step process.
              </p>
            </div>
            
            <Row className="g-4 text-center align-items-start">
              {[
                {
                  icon: <Search size={32} className="text-primary mb-3"/>,
                  title: "1. Search & Find",
                  description: "Browse qualified veterinary providers that specialize in your animal's needs in your area.",
                },
                {
                  icon: <Calendar3 size={32} className="text-primary mb-3"/>,
                  title: "2. Book an Appointment",
                  description: "Schedule a convenient time for the veterinarian to visit your location.",
                },
                {
                  icon: <CardChecklist size={32} className="text-primary mb-3"/>,
                  title: "3. Receive Quality Care",
                  description: "Get professional veterinary services delivered directly to your doorstep.",
                }
              ].map((step, index) => (
                <Col md={4} key={index} className="mb-md-0 mb-4">
                  <div className="mb-3">{step.icon}</div>
                  <h4 className="fw-semibold mb-3">{step.title}</h4>
                  <p className="text-muted mb-0">{step.description}</p>
                </Col>
              ))}
            </Row>
            
            <div className="text-center mt-5">
              <Button 
                as={Link} 
                to="/search-providers"
                variant="primary"
                size="lg"
                aria-label="Start searching for veterinarians"
              >
                Find a Veterinarian Now <ArrowRight className="ms-2" aria-hidden="true" />
              </Button>
            </div>
          </Container>
        </section>

        {/* Testimonials Section - Modern Carousel */}
        <section className="py-5 bg-white scroll-fade-in" role="region" aria-labelledby="testimonials-heading">
          <Container>
            <div className="text-center mb-5">
              <Badge bg="info" className="px-3 py-2 mb-2">TESTIMONIALS</Badge>
              <h2 id="testimonials-heading" className="fw-bold mb-3">What Our Clients Say</h2>
              <p className="text-muted mx-auto" style={{ maxWidth: '800px' }}>
                Hear from pet owners and farmers who have experienced the convenience and quality of our mobile veterinary services.
              </p>
            </div>
            
            <Row className="justify-content-center">
              <Col lg={9}>
                <Carousel 
                  fade
                  controls={true} 
                  indicators={true}
                  interval={5000}
                  pause="hover"
                  keyboard={true}
                  className="bg-light p-5 rounded shadow-sm"
                  aria-label="Customer testimonials carousel"
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
                      <div className="text-center">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name + ' - testimonial'}
                          className="rounded-circle img-fluid shadow-sm mx-auto mb-3"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          loading="lazy"
                        />
                        <div className="mb-2">
                          {[...Array(5)].map((_, i) => <Star key={i} className="text-warning me-1" />)}
                        </div>
                        <blockquote className="blockquote mb-4">
                          <p className="mb-0 fst-italic">"{testimonial.text}"</p>
                        </blockquote>
                        <h5 className="fw-bold mb-0">{testimonial.name}</h5>
                        <p className="text-muted mb-0 small">{testimonial.role}</p>
                      </div>
                    </Carousel.Item>
                  ))}
                  <Carousel.Control prevLabel="" nextLabel="" />
                </Carousel>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Call to Action Section */}
        <section className="py-5 text-white bg-secondary" role="region" aria-labelledby="cta-heading">
          <Container className="text-center">
            <Row className="justify-content-center">
              <Col lg={8} className="scroll-fade-in">
                <h2 id="cta-heading" className="fw-bold mb-4">Join Our Growing Network of Veterinary Professionals</h2>
                <p className="lead mb-4">Expand your practice, set your own schedule, and connect with clients who need your expertise</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <Button 
                    as={Link} 
                    to="/register" 
                    variant="primary" 
                    size="lg"
                    className="fw-semibold"
                    aria-label="Register as Provider"
                  >
                    Register as Provider <ArrowRight className="ms-2" />
                  </Button>
                  <Button 
                    as={Link} 
                    to="/about"
                    variant="outline-light" 
                    size="lg"
                    className="fw-semibold"
                    aria-label="Learn more about providing care"
                  >
                    Learn More
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    </div>
  );
};

export default LandingPage; 