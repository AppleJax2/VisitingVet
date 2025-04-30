import React, { useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Search, Check2Circle, Shield, Clock, Award, 
  People, ArrowRight, Star, GeoAlt, Calendar3, 
  CardChecklist, HeartPulse, TelephonePlus
} from 'react-bootstrap-icons';
import './LandingPage.css';

// Update image fallback URLs with WebP format and fallbacks
const heroVetImage = {
  webp: "/assets/images/landing-page/hero-vet.webp",
  fallback: "https://images.unsplash.com/photo-1581888227599-779811939961?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
};
const smallAnimalImage = {
  webp: "/assets/images/landing-page/small-animal.webp",
  fallback: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
};
const equineImage = {
  webp: "/assets/images/landing-page/equine.webp",
  fallback: "https://images.unsplash.com/photo-1534307980202-7429ecd55b4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
};
const farmAnimalImage = {
  webp: "/assets/images/landing-page/farm-animal.webp",
  fallback: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
};
const ctaBgImage = {
  webp: "/assets/images/landing-page/cta-bg.webp",
  fallback: "https://images.unsplash.com/photo-1551730459-92db2a308d6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
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
    <div className="landing-page">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {/* Hero Section - Modern Design with Animated Content */}
      <header className="hero-section position-relative overflow-hidden scroll-fade-in" role="banner" tabIndex="-1" aria-labelledby="hero-heading">
        <div className="hero-bg-container position-absolute w-100 h-100">
          {/* Consistent overlay gradient */}
          <div className="hero-bg-overlay position-absolute w-100 h-100" 
               style={{ background: 'linear-gradient(135deg, rgba(18, 68, 56, 0.85) 0%, rgba(87, 126, 70, 0.8) 100%)' }}>
          </div>
        </div>
        <Container className="position-relative py-5">
          <Row className="align-items-center min-vh-75">
            <Col lg={7} className="py-5">
              <div className="hero-content fade-in">
                <span className="badge py-2 px-3 mb-3 section-badge-accent">Trusted Veterinary Care</span>
                <h1 id="hero-heading" className="display-4 fw-bold mb-4">Expert Veterinary Care <br/>At Your Doorstep</h1>
                <p className="lead mb-5 text-white-80">Connect with verified mobile veterinary professionals for all your animals - from household pets to farm animals. Quality care that comes to you.</p>
                <div className="d-flex flex-wrap gap-3">
                  <Button 
                    as={Link} 
                    to="/search-providers" 
                    size="lg"
                    className="btn-primary-gradient"
                    aria-label="Find a veterinarian near you"
                  >
                    <Search className="me-2" aria-hidden="true" /> Find a Vet Near You
                  </Button>
                  <Button 
                    as={Link} 
                    to="/register" 
                    variant="outline-light" 
                    size="lg"
                    className="fw-semibold px-4 py-3 border-2"
                    aria-label="Register as a veterinary provider"
                  >
                    Join as a Provider
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={5} className="d-none d-lg-block">
              <div className="hero-image-container p-4 fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="hero-image-wrapper">
                  <picture>
                    <source srcSet={heroVetImage.webp} type="image/webp" />
                    <img 
                      src={heroVetImage.fallback}
                      alt="Veterinarian making a house call with a dog and cat" 
                      className="img-fluid w-100 rounded-3 shadow-lg"
                      style={{ maxHeight: '450px', objectFit: 'cover' }}
                      loading="eager"
                    />
                  </picture>
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
      </header>

      <main id="main-content" ref={mainContentRef} role="main">
        {/* Features Section - Card-based with Icons */}
        <section className="py-5 bg-white section scroll-fade-in features-section" role="region" aria-labelledby="features-heading">
          <Container>
            <div className="text-center mb-5">
              <span className="badge px-3 py-2 mb-2 section-badge-primary">OUR SERVICES</span>
              <h2 id="features-heading" className="section-title fw-bold mb-3">Comprehensive Veterinary Services</h2>
              <p className="text-muted section-description mx-auto" style={{ maxWidth: '800px' }}>
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
                  webp: true,
                  link: "/search-providers?animalType=Small%20Animal"
                },
                {
                  icon: <GeoAlt size={24} />,
                  title: "Equine Services",
                  description: "Specialized care for horses including checkups, dental work, and emergency services.",
                  image: equineImage,
                  webp: true,
                  link: "/search-providers?animalType=Equine"
                },
                {
                  icon: <TelephonePlus size={24} />,
                  title: "Farm Animal Care",
                  description: "Expert care for farm animals with on-site visits to your farm or ranch.",
                  image: farmAnimalImage,
                  webp: true,
                  link: "/search-providers?animalType=Large%20Animal"
                }
              ].map((service, index) => (
                <Col md={4} key={index}>
                  <Card className="h-100 border-0 shadow-hover service-card fade-in" 
                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                    tabIndex="0"
                    role="article"
                    aria-labelledby={`service-title-${index}`}>
                    <div className="position-relative service-image-container" style={{ height: '200px' }}>
                      <picture>
                        <source srcSet={service.image.webp} type="image/webp" />
                        <img 
                          src={service.image.fallback} 
                          alt={service.title + ' - ' + (service.title === 'Small Animal Care' ? 'Dog and cat' : service.title === 'Equine Services' ? 'Horse' : 'Farm animals')}
                          className="w-100 h-100" 
                          style={{ objectFit: 'cover', aspectRatio: '4/3' }}
                          loading="lazy"
                        />
                      </picture>
                      <div className="service-icon position-absolute">
                        {service.icon}
                      </div>
                    </div>
                    <Card.Body className="pt-4 px-4 pb-4">
                      <Card.Title id={`service-title-${index}`} className="fs-5 fw-bold text-primary mb-3">{service.title}</Card.Title>
                      <Card.Text className="mb-3 text-muted">
                        {service.description}
                      </Card.Text>
                      <Link 
                        to={service.link}
                        className="learn-more-link"
                        aria-label={`Learn more about ${service.title}`}
                      >
                        Learn More <ArrowRight size={14} className="ms-1" aria-hidden="true" />
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* How It Works Section - Timeline Style */}
        <section className="py-5 bg-light section scroll-fade-in" role="region" aria-labelledby="how-it-works-heading">
          <Container>
            <div className="text-center mb-5">
              <span className="badge px-3 py-2 mb-2 section-badge-secondary">SIMPLE PROCESS</span>
              <h2 id="how-it-works-heading" className="section-title fw-bold mb-3">How It Works</h2>
              <p className="text-muted section-description mx-auto" style={{ maxWidth: '800px' }}>
                Getting quality veterinary care for your animals has never been easier with our simple three-step process.
              </p>
            </div>
            
            <div className="how-it-works-timeline position-relative py-4">
              {/* Vertical line for desktop */}
              <div className="d-none d-md-block position-absolute timeline-line"></div>
              
              <Row className="g-5">
                {[
                  {
                    icon: <Search size={28} />,
                    title: "Search & Find",
                    description: "Browse qualified veterinary providers that specialize in your animal's needs in your area.",
                    color: "var(--primary-main)"
                  },
                  {
                    icon: <Calendar3 size={28} />,
                    title: "Book an Appointment",
                    description: "Schedule a convenient time for the veterinarian to visit your location.",
                    color: "var(--secondary-main)"
                  },
                  {
                    icon: <CardChecklist size={28} />,
                    title: "Receive Quality Care",
                    description: "Get professional veterinary services delivered directly to your doorstep.",
                    color: "var(--accent-gold)"
                  }
                ].map((step, index) => (
                  <Col md={4} key={index} className="mb-md-0 mb-4">
                    <div className="text-center fade-in" style={{ 
                      animationDelay: `${0.2 * (index + 1)}s`,
                      position: 'relative',
                      zIndex: 2
                    }}>
                      <div className="step-number position-relative mb-4" role="listitem" aria-label={`Step ${index + 1}: ${step.title}`}>
                        <div className="step-circle-outer" style={{ backgroundColor: `${step.color}20` }}>
                          <div className="step-circle-inner" style={{ backgroundColor: step.color }}>
                            {step.icon}
                          </div>
                          <div className="step-number-badge" style={{ border: `2px solid ${step.color}`, color: step.color }}>
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
                aria-label="Start searching for veterinarians"
              >
                Find a Veterinarian Now <ArrowRight className="ms-2" aria-hidden="true" />
              </Button>
            </div>
          </Container>
        </section>

        {/* Testimonials Section - Modern Carousel */}
        <section className="py-5 position-relative overflow-hidden section scroll-fade-in" role="region" aria-labelledby="testimonials-heading">
          <Container>
            <div className="text-center mb-5">
              <span className="badge px-3 py-2 mb-2 section-badge-accent">TESTIMONIALS</span>
              <h2 id="testimonials-heading" className="section-title fw-bold mb-3">What Our Clients Say</h2>
              <p className="text-muted section-description mx-auto" style={{ maxWidth: '800px' }}>
                Hear from pet owners and farmers who have experienced the convenience and quality of our mobile veterinary services.
              </p>
            </div>
            
            <Carousel 
              fade
              controls={true} 
              indicators={true}
              interval={5000}
              pause="hover"
              keyboard={true}
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
                  <div className="testimonial-container py-4">
                    <Row className="justify-content-center">
                      <Col md={10} lg={8}>
                        <Card className="border-0 shadow-lg testimonial-card">
                          <Card.Body className="p-0">
                            <Row className="g-0">
                              <Col md={4} className="d-none d-md-block testimonial-profile-col">
                                <div className="testimonial-quote-icon position-absolute">
                                  "
                                </div>
                                <div className="d-flex flex-column justify-content-center align-items-center h-100 p-4">
                                  <div className="testimonial-image mb-3">
                                    <img 
                                      src={testimonial.image} 
                                      alt={testimonial.name + ' - testimonial'}
                                      className="w-100 h-100"
                                      style={{ objectFit: 'cover', aspectRatio: '1/1' }}
                                      loading="lazy"
                                    />
                                  </div>
                                  <h5 className="text-white mb-1 fw-bold">{testimonial.name}</h5>
                                  <p className="text-white-80 mb-0 small">{testimonial.role}</p>
                                </div>
                              </Col>
                              <Col md={8}>
                                <div className="p-4 p-md-5 d-flex flex-column justify-content-center h-100">
                                  <div className="d-md-none d-flex align-items-center mb-4">
                                    <img 
                                      src={testimonial.image} 
                                      alt={testimonial.name + ' - testimonial'}
                                      className="rounded-circle me-3"
                                      style={{ width: '60px', height: '60px', objectFit: 'cover', aspectRatio: '1/1' }}
                                      loading="lazy"
                                    />
                                    <div>
                                      <h5 className="mb-0 fw-bold">{testimonial.name}</h5>
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
                                  <p className="testimonial-text mb-0 fs-5 fw-medium">"{testimonial.text}"</p>
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
              <Carousel.Prev aria-label="Previous testimonial" />
              <Carousel.Next aria-label="Next testimonial" />
            </Carousel>
          </Container>
        </section>

        {/* Call to Action Section */}
        <section className="cta-section py-5 position-relative scroll-fade-in" role="region" aria-labelledby="cta-heading" style={{
          background: `linear-gradient(rgba(18, 68, 56, 0.9), rgba(87, 126, 70, 0.9)), url("${ctaBgImage.fallback}") no-repeat center center/cover`,
          padding: '80px 0',
        }}>
          <Container className="text-center text-white">
            <Row className="justify-content-center">
              <Col lg={8}>
                <h2 id="cta-heading" className="fw-bold mb-4">Join Our Growing Network of Veterinary Professionals</h2>
                <p className="lead mb-4">Expand your practice, set your own schedule, and connect with clients who need your expertise</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <Button 
                    as={Link} 
                    to="/register" 
                    variant="primary"
                    size="lg"
                    className="fw-semibold px-4 py-3"
                    aria-label="Register as Provider"
                  >
                    Register as Provider <ArrowRight className="ms-2" />
                  </Button>
                  <Button 
                    as={Link} 
                    to="/about-providers" 
                    variant="outline-light" 
                    size="lg"
                    className="fw-semibold px-4 py-3"
                    aria-label="Learn more about providing care"
                  >
                    Learn More
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>

          {/* Decorative elements */}
          <div className="position-absolute decorative-circle-1"></div>
          <div className="position-absolute decorative-circle-2"></div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage; 