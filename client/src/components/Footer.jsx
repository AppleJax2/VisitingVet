import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
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
import theme from '../utils/theme';

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
    <footer className="bg-dark-color text-white">
      {/* Main Footer */}
      <div className="pt-5 pb-4">
        <Container>
          <Row className="gy-4">
            {/* Company Info */}
            <Col lg={3} md={6}>
              <h4 className="text-white fw-bold mb-4">VisitingVet</h4>
              <p className="text-white-80 mb-4">
                Connecting pet owners with trusted, mobile veterinary services for convenient and quality animal healthcare.
              </p>
              <div className="d-flex social-icons gap-2">
                {socialMedia.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </Col>
            
            {/* Quick Links */}
            <Col lg={3} md={6}>
              <h5 className="text-white fw-semibold mb-4">Quick Links</h5>
              <ul className="list-unstyled footer-links">
                {quickLinks.map((link, index) => (
                  <li key={index} className="mb-3">
                    <Link 
                      to={link.path} 
                      className="text-white-70 text-decoration-none d-flex align-items-center"
                    >
                      <ChevronRight size={12} className="me-2 text-accent-gold" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Col>
            
            {/* Services */}
            <Col lg={3} md={6}>
              <h5 className="text-white fw-semibold mb-4">Our Services</h5>
              <ul className="list-unstyled footer-links">
                {serviceLinks.map((service, index) => (
                  <li key={index} className="mb-3">
                    <Link 
                      to={service.path} 
                      className="text-white-70 text-decoration-none d-flex align-items-center"
                    >
                      <ChevronRight size={12} className="me-2 text-accent-gold" />
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Col>
            
            {/* Contact Info */}
            <Col lg={3} md={6}>
              <h5 className="text-white fw-semibold mb-4">Contact Us</h5>
              <ul className="list-unstyled contact-info mb-4">
                <li className="d-flex mb-3">
                  <GeoAlt className="me-3 mt-1 text-accent-gold" />
                  <span className="text-white-70">
                    123 Veterinary Lane<br />
                    San Francisco, CA 94107
                  </span>
                </li>
                <li className="d-flex mb-3">
                  <Telephone className="me-3 mt-1 text-accent-gold" />
                  <a href="tel:+15551234567" className="text-white-70 text-decoration-none">
                    (555) 123-4567
                  </a>
                </li>
                <li className="d-flex mb-3">
                  <Envelope className="me-3 mt-1 text-accent-gold" />
                  <a href="mailto:support@visitingvet.com" className="text-white-70 text-decoration-none">
                    support@visitingvet.com
                  </a>
                </li>
              </ul>
              
              {/* Newsletter Signup */}
              <h5 className="text-white fw-semibold mb-3">Subscribe to Newsletter</h5>
              <div className="input-group">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Your Email" 
                  aria-label="Your email address"
                  style={{ borderRadius: 'var(--border-radius-md) 0 0 var(--border-radius-md)' }}
                />
                <Button 
                  variant="secondary"
                  className="px-3"
                  aria-label="Subscribe to newsletter"
                  style={{ borderRadius: '0 var(--border-radius-md) var(--border-radius-md) 0' }}
                >
                  Subscribe
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Bottom Footer/Copyright */}
      <div className="py-3" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
              <div className="text-white-70">
                &copy; {currentYear} VisitingVet. All rights reserved.
              </div>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <div className="footer-bottom-links">
                <Link to="/privacy-policy" className="text-white-70 text-decoration-none mx-3">Privacy Policy</Link>
                <Link to="/terms-of-service" className="text-white-70 text-decoration-none mx-3">Terms of Service</Link>
                <Link to="/faq" className="text-white-70 text-decoration-none mx-3">FAQ</Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer; 