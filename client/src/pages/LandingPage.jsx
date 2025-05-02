import React, { useEffect, useState } from 'react';
// import { Container, Row, Col, Card, Button, Carousel, Badge } from 'react-bootstrap'; // REMOVE react-bootstrap
import {
  CContainer, CRow, CCol, CCard, CButton, CCarousel, CBadge, CImage, CCardBody, CCardTitle, CCardText, CListGroup, CListGroupItem, CFooter,
  CAccordion, CAccordionItem, CAccordionHeader, CAccordionBody // Added Accordion components
} from '@coreui/react'; // ADD CoreUI components
import { Link } from 'react-router-dom';
// import { Search, Check2Circle, Shield, Clock, Award, People, ArrowRight, Star, GeoAlt, Calendar3, CardChecklist, HeartPulse, TelephonePlus } from 'react-bootstrap-icons'; // REMOVE react-bootstrap-icons
import CIcon from '@coreui/icons-react'; // ADD CoreUI Icons
import { cilSearch, cilUserPlus, cilCheckCircle, cilShieldAlt, cilClock, cilAward, cilPeople, cilArrowRight, cilStar, cilLocationPin, cilCalendar, cilList, cilHeart, cilPhone, cilHome, cilMedicalCross, cilDollar, cilClock as cilClockIcon } from '@coreui/icons'; // ADD specific CoreUI Icons

// REMOVE old CSS import
// import '../styles/LandingPage.css';

// Define actual image URL (replace with final chosen asset)
const heroImageUrl = 'https://images.pexels.com/photos/7708806/pexels-photo-7708806.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
// ADD ALT TEXT DESCRIPTION
const heroImageAltText = "Veterinarian examining a golden retriever dog while a cat sits nearby in a cozy home environment";

// Remove placeholder image objects
// const heroVetImage = {...};
// const smallAnimalImage = {...};
// ...etc...

// Fallback hero background color remains useful
const HERO_BG_COLOR = '#124438'; // Example color, align with CoreUI theme later

const LandingPage = () => {
  const [useSimplifiedView, setUseSimplifiedView] = useState(false);

  useEffect(() => {
    // Remove old scroll fade-in logic if not reimplemented with CoreUI utils
    // document.querySelectorAll('.scroll-fade-in').forEach(el => {
    //   if (el) el.classList.add('visible');
    // });

    const handleError = (error) => { // Catch rendering errors specifically
      console.error('Error rendering Landing Page:', error);
      setUseSimplifiedView(true);
    };

    // Add error boundary or simpler JS error listener if needed
    window.addEventListener('error', handleError); // Keep generic for now

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Simplified fallback view using basic HTML or minimal CoreUI if possible
  if (useSimplifiedView) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Welcome to Visiting Vet</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>
          Expert veterinary care that comes to you. Connect with verified mobile veterinary professionals.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Use basic links or CoreUI Buttons if safe */}
          <CButton color="primary" href="/search-providers">Find a Vet Near You</CButton>
          <CButton variant="outline" color="primary" href="/register">Join as a Provider</CButton>
        </div>
      </div>
    );
  }

  // Regular view using CoreUI components
  return (
    <div className="landing-page-container"> {/* Keep a root container if needed for specific styles */}
      <a href="#main-content" className="visually-hidden-focusable">Skip to main content</a>

      {/* Hero Section using CoreUI */}
      <div // Use a div instead of header for more flexibility with CoreUI structure if needed
        className="position-relative overflow-hidden text-white p-5 text-center"
        style={{
          backgroundColor: HERO_BG_COLOR, // Fallback color
          backgroundImage: `linear-gradient(rgba(18, 68, 56, 0.7), rgba(18, 68, 56, 0.7)), url(${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center' // Center content vertically and horizontally
        }}
        role="banner" // Add role for semantic header
        aria-label="Hero section: Expert Veterinary Care At Your Doorstep"
      >
        {/* Optionally add an CImage component for better alt text handling if background image is purely decorative */}
        {/* <CImage className="visually-hidden" src={heroImageUrl} alt={heroImageAltText} /> */}
        <CContainer>
          <CRow className="justify-content-center">
            <CCol lg={8}>
              {/* Example: Use CBadge for consistency */}
              {/* <CBadge color="info" className="p-2 px-3 mb-3 fs-5">Trusted Veterinary Care</CBadge> */}
              {/* Typography classes from Bootstrap/CoreUI */}
              <h1 className="display-4 fw-bold mb-4">Expert Veterinary Care <br/>At Your Doorstep</h1>
              <p className="lead mb-5" style={{ color: 'rgba(255, 255, 255, 0.85)' }}> {/* Ensure contrast */}
                Connect with verified mobile veterinary professionals for all your animals - from household pets to farm animals. Quality care that comes to you.
              </p>
              <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
                <CButton
                  as={Link}
                  to="/search-providers"
                  color="primary" // Use CoreUI theme color
                  size="lg"
                  className="px-4 gap-3"
                >
                  <CIcon icon={cilSearch} className="me-2" /> Find a Vet Near You
                </CButton>
                <CButton
                  as={Link}
                  to="/register"
                  variant="outline" // CoreUI outline style
                  color="light" // Against dark background
                  size="lg"
                  className="px-4 fw-semibold"
                >
                   <CIcon icon={cilUserPlus} className="me-2" /> Join as a Provider
                </CButton>
              </div>
            </CCol>
          </CRow>
        </CContainer>
      </div>

      <main id="main-content" className="py-5">
        <CContainer>
          {/* How It Works Section */}
          <section className="text-center mb-5 py-4">
            <h2 className="fw-bold mb-4">How It Works</h2>
            <CRow className="g-4 justify-content-center">
              <CCol md={4}>
                <CCard className="h-100 shadow-sm">
                  <CCardBody>
                    <CIcon icon={cilSearch} size="xxl" className="text-primary mb-3" />
                    <CCardTitle as="h5" className="mb-2 fw-semibold">1. Find Your Vet</CCardTitle>
                    <CCardText>Search our network of verified professionals by location and specialty.</CCardText>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol md={4}>
                <CCard className="h-100 shadow-sm">
                  <CCardBody>
                    <CIcon icon={cilCalendar} size="xxl" className="text-primary mb-3" />
                    <CCardTitle as="h5" className="mb-2 fw-semibold">2. Book an Appointment</CCardTitle>
                    <CCardText>Choose a convenient time slot directly through their profile.</CCardText>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol md={4}>
                <CCard className="h-100 shadow-sm">
                  <CCardBody>
                    <CIcon icon={cilHome} size="xxl" className="text-primary mb-3" />
                    <CCardTitle as="h5" className="mb-2 fw-semibold">3. Receive Care at Home</CCardTitle>
                    <CCardText>The vet comes to you, providing care in your animal's comfortable environment.</CCardText>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </section>

          {/* Services Offered Section - Using Accordion */}
          <section className="mb-5 py-4 bg-light rounded p-4">
            <h2 className="fw-bold mb-4 text-center">Comprehensive Services</h2>
            <CAccordion alwaysOpen>
              <CAccordionItem itemKey={1}>
                <CAccordionHeader><CIcon icon={cilHeart} className="me-2"/> Routine Checkups & Wellness</CAccordionHeader>
                <CAccordionBody>
                  Preventative care, vaccinations, health screenings, and nutritional advice to keep your pets healthy year-round.
                </CAccordionBody>
              </CAccordionItem>
              <CAccordionItem itemKey={2}>
                <CAccordionHeader><CIcon icon={cilMedicalCross} className="me-2"/> Diagnostics & Treatment</CAccordionHeader>
                <CAccordionBody>
                  Mobile diagnostics, treatment for common illnesses, minor injury care, and chronic condition management.
                </CAccordionBody>
              </CAccordionItem>
              <CAccordionItem itemKey={3}>
                <CAccordionHeader><CIcon icon={cilPeople} className="me-2"/> Farm & Large Animal Care</CAccordionHeader>
                <CAccordionBody>
                  Specialized services for equine, bovine, ovine, and other farm animals, including herd health and emergency services.
                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>
          </section>

          {/* For Providers Section */}
          <section className="text-center mb-5 py-4">
            <h2 className="fw-bold mb-4">Join Our Growing Network</h2>
            <p className="lead text-medium-emphasis mb-4">Expand your practice, set your own schedule, and connect with clients who need your expertise.</p>
             <CRow className="g-4 justify-content-center mb-4">
               <CCol md={4}>
                 <CIcon icon={cilClockIcon} size="xl" className="text-success mb-2" />
                 <p className="fw-semibold">Flexible Scheduling</p>
               </CCol>
               <CCol md={4}>
                 <CIcon icon={cilDollar} size="xl" className="text-success mb-2" />
                 <p className="fw-semibold">Reach New Clients</p>
               </CCol>
               <CCol md={4}>
                 <CIcon icon={cilUserPlus} size="xl" className="text-success mb-2" />
                 <p className="fw-semibold">Easy Management Tools</p>
               </CCol>
             </CRow>
            <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
              <CButton as={Link} to="/register" color="primary" size="lg" className="px-4">
                Register as Provider
              </CButton>
              <CButton as={Link} to="/about" variant="outline" color="secondary" size="lg" className="px-4">
                Learn More
              </CButton>
            </div>
          </section>

        </CContainer>
      </main>

      {/* Footer Section */}
      <CFooter className="bg-dark text-white mt-auto py-4">
        <CContainer>
          <CRow>
            <CCol xs={12} md={4} className="mb-3 mb-md-0">
              <h5>VisitingVet</h5>
              <p className="text-medium-emphasis small">Quality veterinary care that comes to you.</p>
            </CCol>
            <CCol xs={6} md={2} className="mb-3 mb-md-0">
              <h6>Quick Links</h6>
              <ul className="list-unstyled">
                <li><Link to="/search-providers" className="text-white text-decoration-none small">Find a Vet</Link></li>
                <li><Link to="/about" className="text-white text-decoration-none small">About Us</Link></li>
                <li><Link to="/services" className="text-white text-decoration-none small">Services</Link></li>
              </ul>
            </CCol>
            <CCol xs={6} md={3} className="mb-3 mb-md-0">
              <h6>For Providers</h6>
              <ul className="list-unstyled">
                <li><Link to="/register" className="text-white text-decoration-none small">Join Network</Link></li>
                {/* Add link to Provider FAQ/Info if available */}
              </ul>
            </CCol>
             <CCol xs={12} md={3}>
              <h6>Legal</h6>
              <ul className="list-unstyled">
                <li><Link to="/privacy" className="text-white text-decoration-none small">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-white text-decoration-none small">Terms of Service</Link></li>
              </ul>
            </CCol>
          </CRow>
          <hr className="my-3" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
          <p className="text-center text-medium-emphasis small mb-0">
            &copy; {new Date().getFullYear()} VisitingVet. All Rights Reserved.
          </p>
        </CContainer>
      </CFooter>

    </div>
  );
};

export default LandingPage; 