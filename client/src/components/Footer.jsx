import React from 'react';
import { Container, Row, Col, Button, InputGroup, FormControl } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  GeoAlt,
  Envelope,
  Telephone,
  ChevronRight
} from 'react-bootstrap-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Centralized social media data for consistency
  const socialMedia = [
    { icon: <Facebook />, url: 'https://facebook.com', label: 'Facebook' },
    { icon: <Twitter />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <Instagram />, url: 'https://instagram.com', label: 'Instagram' },
    { icon: <Linkedin />, url: 'https://linkedin.com', label: 'LinkedIn' }
  ];

  // Centralized link data for consistency
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find a Vet', path: '/search-providers' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Blog', path: '/blog' },
  ];
  
  const serviceLinks = [
    { name: 'Small Animal Care', path: '/search-providers?animalType=Small%20Animal' },
    { name: 'Equine Services', path: '/search-providers?animalType=Equine' },
    { name: 'Farm Animal Care', path: '/search-providers?animalType=Large%20Animal' },
    { name: 'Preventative Care', path: '/services#preventative' },
    { name: 'Emergency Services', path: '/services#emergency' }
  ];
  
  return (
    <footer className="text-white pt-5 pb-4 bg-dark" data-bs-theme="dark">
      <Container>
        <Row className="gy-4">
          {/* Company Info */}
          <Col lg={3} md={6}>
            <h4 className="fw-bold mb-4">VisitingVet</h4>
            <p className="text-white-50 mb-4">
              Connecting pet owners with trusted, mobile veterinary services for convenient and quality animal healthcare.
            </p>
            <div className="d-flex gap-2">
              {socialMedia.map((social, index) => (
                <a 
                  key={index}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-light btn-sm rounded-circle p-2 lh-1"
                  aria-label={social.label}
                >
                  {React.cloneElement(social.icon, { size: 16 })}
                </a>
              ))}
            </div>
          </Col>
          
          {/* Quick Links */}
          <Col lg={3} md={6}>
            <h5 className="fw-semibold mb-4">Quick Links</h5>
            <ul className="list-unstyled">
              {quickLinks.map((link, index) => (
                <li key={index} className="mb-2">
                  <Link 
                    to={link.path} 
                    className="link-light link-opacity-75 link-opacity-100-hover text-decoration-none d-flex align-items-center"
                  >
                    <ChevronRight size={12} className="me-2 text-primary" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>
          
          {/* Services */}
          <Col lg={3} md={6}>
            <h5 className="fw-semibold mb-4">Our Services</h5>
            <ul className="list-unstyled">
              {serviceLinks.map((service, index) => (
                <li key={index} className="mb-2">
                  <Link 
                    to={service.path} 
                    className="link-light link-opacity-75 link-opacity-100-hover text-decoration-none d-flex align-items-center"
                  >
                    <ChevronRight size={12} className="me-2 text-primary" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>
          
          {/* Contact Info */}
          <Col lg={3} md={6}>
            <h5 className="fw-semibold mb-4">Contact Us</h5>
            <ul className="list-unstyled mb-4">
              <li className="d-flex mb-3">
                <GeoAlt className="me-3 mt-1 text-primary flex-shrink-0" />
                <span className="text-white-50">
                  123 Veterinary Lane<br />
                  San Francisco, CA 94107
                </span>
              </li>
              <li className="d-flex mb-3">
                <Telephone className="me-3 mt-1 text-primary flex-shrink-0" />
                <a href="tel:+15551234567" className="link-light link-opacity-75 link-opacity-100-hover text-decoration-none">
                  (555) 123-4567
                </a>
              </li>
              <li className="d-flex mb-3">
                <Envelope className="me-3 mt-1 text-primary flex-shrink-0" />
                <a href="mailto:support@visitingvet.com" className="link-light link-opacity-75 link-opacity-100-hover text-decoration-none">
                  support@visitingvet.com
                </a>
              </li>
            </ul>
            
            {/* Newsletter Signup */}
            <h5 className="fw-semibold mb-3">Subscribe</h5>
            <Form onSubmit={(e) => e.preventDefault()}>
              <InputGroup>
                <FormControl 
                  type="email" 
                  placeholder="Your Email" 
                  aria-label="Your email address"
                />
                <Button 
                  variant="primary"
                  type="submit"
                  aria-label="Subscribe to newsletter"
                >
                  Subscribe
                </Button>
              </InputGroup>
            </Form>
          </Col>
        </Row>
      </Container>
      
      {/* Bottom Footer/Copyright */}
      <div className="py-3 mt-4 bg-black bg-opacity-25">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
              <div className="text-white-50 small">
                &copy; {currentYear} VisitingVet. All rights reserved.
              </div>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <div className="small">
                <Link to="/privacy-policy" className="link-light link-opacity-75 link-opacity-100-hover text-decoration-none mx-2">Privacy Policy</Link>
                <Link to="/terms-of-service" className="link-light link-opacity-75 link-opacity-100-hover text-decoration-none mx-2">Terms of Service</Link>
                <Link to="/faq" className="link-light link-opacity-75 link-opacity-100-hover text-decoration-none mx-2">FAQ</Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer; 