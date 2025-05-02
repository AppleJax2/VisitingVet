import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Card, Button, Carousel, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Search, Check2Circle, Shield, Clock, Award, 
  People, ArrowRight, Star, GeoAlt, Calendar3, 
  CardChecklist, HeartPulse, TelephonePlus
} from 'react-bootstrap-icons';

// Import our landing page CSS
import '../styles/LandingPage.css';

// Import images directly or use relative URLs
// Either import the actual images:
// import heroImage from '../assets/images/landing-page/hero-vet.jpg';
// Or use reliable URLs for placeholder images:
const heroVetImage = {
  webp: "https://placehold.co/1200x600/124438/FFFFFF.webp?text=Visiting+Vet",
  fallback: "https://placehold.co/1200x600/124438/FFFFFF.jpg?text=Visiting+Vet"
};

const smallAnimalImage = {
  webp: "https://placehold.co/800x500/4289f5/FFFFFF.webp?text=Small+Animal+Care",
  fallback: "https://placehold.co/800x500/4289f5/FFFFFF.jpg?text=Small+Animal+Care"
};

const equineImage = {
  webp: "https://placehold.co/800x500/8a42f5/FFFFFF.webp?text=Equine+Services",
  fallback: "https://placehold.co/800x500/8a42f5/FFFFFF.jpg?text=Equine+Services"
};

const farmAnimalImage = {
  webp: "https://placehold.co/800x500/42f584/FFFFFF.webp?text=Farm+Animal+Care",
  fallback: "https://placehold.co/800x500/42f584/FFFFFF.jpg?text=Farm+Animal+Care"
};

const ctaBgImage = {
  webp: "https://placehold.co/1200x400/577e46/FFFFFF.webp?text=Join+Our+Network",
  fallback: "https://placehold.co/1200x400/577e46/FFFFFF.jpg?text=Join+Our+Network"
};

// Fallback hero background color in case image loading fails
const HERO_BG_COLOR = '#124438';

const LandingPage = () => {
  const [useSimplifiedView, setUseSimplifiedView] = useState(false);
  
  useEffect(() => {
    // Make all elements visible immediately
    document.querySelectorAll('.scroll-fade-in').forEach(el => {
      if (el) el.classList.add('visible');
    });
    
    // Set up error handling in case of issues
    const handleError = () => {
      console.log('Switching to simplified view due to errors');
      setUseSimplifiedView(true);
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Super simplified fallback view that should always work
  if (useSimplifiedView) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Welcome to Visiting Vet</h1>
        <p style={{ textAlign: 'center', fontSize: '18px', marginBottom: '30px' }}>
          Expert veterinary care that comes to you. Connect with verified mobile veterinary professionals for all your animals.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link to="/search-providers" style={{ 
            padding: '10px 20px', 
            background: '#321fdb', 
            color: 'white', 
            borderRadius: '5px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Find a Vet Near You
          </Link>
          <Link to="/register" style={{ 
            padding: '10px 20px', 
            border: '1px solid #321fdb', 
            color: '#321fdb', 
            borderRadius: '5px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Join as a Provider
          </Link>
        </div>
      </div>
    );
  }

  // Regular view with all the bells and whistles
  return (
    <div className="landing-page-container">
      <a href="#main-content" className="visually-hidden-focusable">Skip to main content</a>
      
      {/* Hero Section */}
      <header 
        className="position-relative overflow-hidden text-white p-5 text-center"
        style={{ 
          backgroundColor: HERO_BG_COLOR,
          backgroundImage: `linear-gradient(rgba(18, 68, 56, 0.7), rgba(87, 126, 70, 0.7)), url(https://placehold.co/1200x600/124438/FFFFFF.jpg?text=Visiting+Vet)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="scroll-fade-in visible">
              <Badge bg="info" className="py-2 px-3 mb-3">Trusted Veterinary Care</Badge>
              <h1 className="display-4 fw-bold mb-4">Expert Veterinary Care <br/>At Your Doorstep</h1>
              <p className="lead mb-5 text-white-80">Connect with verified mobile veterinary professionals for all your animals - from household pets to farm animals. Quality care that comes to you.</p>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <Button 
                  as={Link} 
                  to="/search-providers" 
                  variant="primary"
                  size="lg"
                >
                  <Search className="me-2" /> Find a Vet Near You
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="outline-light" 
                  size="lg"
                  className="fw-semibold"
                >
                  Join as a Provider
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </header>

      <main id="main-content" className="py-5">
        <Container>
          {/* Features Section */}
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Comprehensive Veterinary Services</h2>
            <p>
              From routine checkups to specialized treatments, our mobile veterinary professionals bring a wide range of services directly to you.
            </p>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-5">
            <h2 className="fw-bold mb-4">Join Our Growing Network of Veterinary Professionals</h2>
            <p className="mb-4">Expand your practice, set your own schedule, and connect with clients who need your expertise</p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Button 
                as={Link} 
                to="/register" 
                variant="primary" 
                size="lg"
              >
                Register as Provider
              </Button>
              <Button 
                as={Link} 
                to="/about"
                variant="outline-secondary" 
                size="lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
};

export default LandingPage; 