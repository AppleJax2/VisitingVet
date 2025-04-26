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
  
  return (
    <footer style={{ 
      backgroundColor: theme.colors.background.dark,
      color: 'white',
      padding: '4rem 0 0',
    }}>
      <Container>
        <Row className="gy-4">
          {/* Company Info */}
          <Col lg={3} md={6}>
            <h4 className="text-white mb-4" style={{ 
              fontFamily: theme.fonts.heading,
              fontWeight: 'bold' 
            }}>VisitingVet</h4>
            <p className="text-white-50">
              Connecting pet owners with trusted, mobile veterinary services for convenient and quality animal healthcare.
            </p>
            <div className="d-flex mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="me-3" style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.3s ease'
              }}>
                <Facebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="me-3" style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.3s ease'
              }}>
                <Twitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="me-3" style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.3s ease'
              }}>
                <Instagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="me-3" style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.3s ease'
              }}>
                <Linkedin />
              </a>
            </div>
          </Col>
          
          {/* Quick Links */}
          <Col lg={3} md={6}>
            <h5 className="text-white mb-4">Quick Links</h5>
            <ul className="list-unstyled footer-links">
              {[
                { name: 'Home', path: '/' },
                { name: 'Find a Vet', path: '/search-providers' },
                { name: 'About Us', path: '/about' },
                { name: 'Services', path: '/services' },
                { name: 'Blog', path: '/blog' },
              ].map((link, index) => (
                <li key={index} className="mb-2">
                  <Link to={link.path} className="text-white-50 text-decoration-none" style={{
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <ChevronRight size={12} className="me-2" style={{ color: theme.colors.accent.gold }} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>
          
          {/* Services */}
          <Col lg={3} md={6}>
            <h5 className="text-white mb-4">Our Services</h5>
            <ul className="list-unstyled footer-links">
              {[
                { name: 'Small Animal Care', path: '/search-providers?animalType=Small%20Animal' },
                { name: 'Equine Services', path: '/search-providers?animalType=Equine' },
                { name: 'Farm Animal Care', path: '/search-providers?animalType=Large%20Animal' },
                { name: 'Preventative Care', path: '/services#preventative' },
                { name: 'Emergency Services', path: '/services#emergency' }
              ].map((service, index) => (
                <li key={index} className="mb-2">
                  <Link to={service.path} className="text-white-50 text-decoration-none" style={{
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <ChevronRight size={12} className="me-2" style={{ color: theme.colors.accent.gold }} />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>
          
          {/* Contact Info */}
          <Col lg={3} md={6}>
            <h5 className="text-white mb-4">Contact Us</h5>
            <ul className="list-unstyled contact-info">
              <li className="d-flex mb-3">
                <GeoAlt className="me-3 mt-1" style={{ color: theme.colors.accent.gold }} />
                <span className="text-white-50">
                  123 Veterinary Lane<br />
                  San Francisco, CA 94107
                </span>
              </li>
              <li className="d-flex mb-3">
                <Telephone className="me-3 mt-1" style={{ color: theme.colors.accent.gold }} />
                <span className="text-white-50">(555) 123-4567</span>
              </li>
              <li className="d-flex mb-3">
                <Envelope className="me-3 mt-1" style={{ color: theme.colors.accent.gold }} />
                <span className="text-white-50">support@visitingvet.com</span>
              </li>
            </ul>
            
            {/* Newsletter Signup */}
            <h5 className="text-white mt-4 mb-3">Subscribe to Newsletter</h5>
            <div className="input-group">
              <input 
                type="email" 
                className="form-control" 
                placeholder="Your Email" 
                style={{
                  borderRadius: `${theme.borderRadius.md} 0 0 ${theme.borderRadius.md}`,
                  border: 'none'
                }}
              />
              <Button 
                variant="primary" 
                style={{
                  backgroundColor: theme.colors.secondary.main,
                  borderColor: theme.colors.secondary.main,
                  borderRadius: `0 ${theme.borderRadius.md} ${theme.borderRadius.md} 0`,
                }}
              >
                Subscribe
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
      
      {/* Bottom Footer/Copyright */}
      <div className="bottom-footer py-3 mt-5" style={{ 
        backgroundColor: 'rgba(0,0,0,0.2)'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
              <div className="text-white-50">
                &copy; {currentYear} VisitingVet. All rights reserved.
              </div>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <div className="footer-links">
                <Link to="/privacy-policy" className="text-white-50 text-decoration-none mx-2">Privacy Policy</Link>
                <Link to="/terms-of-service" className="text-white-50 text-decoration-none mx-2">Terms of Service</Link>
                <Link to="/faq" className="text-white-50 text-decoration-none mx-2">FAQ</Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer; 