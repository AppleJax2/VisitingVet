import React, { useEffect, useState } from 'react';
// import { Container, Row, Col, Card, Button, Carousel, Badge } from 'react-bootstrap'; // REMOVE react-bootstrap
import {
  CContainer, CRow, CCol, CCard, CButton, CCarousel, CBadge, CImage, CCardBody, CCardTitle, CCardText, CListGroup, CListGroupItem, CFooter
} from '@coreui/react'; // ADD CoreUI components
import { Link } from 'react-router-dom';
// import { Search, Check2Circle, Shield, Clock, Award, People, ArrowRight, Star, GeoAlt, Calendar3, CardChecklist, HeartPulse, TelephonePlus } from 'react-bootstrap-icons'; // REMOVE react-bootstrap-icons
import CIcon from '@coreui/icons-react'; // ADD CoreUI Icons
import { cilSearch, cilUserPlus, cilCheckCircle, cilShieldAlt, cilClock, cilAward, cilPeople, cilArrowRight, cilStar, cilLocationPin, cilCalendar, cilList, cilHeart, cilPhone } from '@coreui/icons'; // ADD specific CoreUI Icons

// REMOVE old CSS import
// import '../styles/LandingPage.css';

// Define actual image URL (replace with final chosen asset)
const heroImageUrl = 'https://images.pexels.com/photos/7708806/pexels-photo-7708806.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

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
      >
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

      <main id="main-content">
        {/* Sections will be added in Layout Refinement task */}
        <CContainer className="py-5">
          {/* Placeholder for new sections */}
           <div className="text-center mb-5">
             <h2 className="fw-bold mb-3">Comprehensive Veterinary Services</h2>
             <p className="lead text-medium-emphasis"> {/* Use CoreUI text color class */}
                From routine checkups to specialized treatments, our mobile veterinary professionals bring a wide range of services directly to you.
              </p>
            </div>

           <div className="text-center mt-5">
             <h2 className="fw-bold mb-4">Join Our Growing Network</h2>
             <p className="lead text-medium-emphasis mb-4">Expand your practice, set your own schedule, and connect with clients who need your expertise.</p>
             <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
               <CButton
                 as={Link}
                 to="/register"
                 color="primary"
                 size="lg"
                 className="px-4"
               >
                 Register as Provider
               </CButton>
               <CButton
                 as={Link}
                 to="/about" // Link to an 'About' or 'Learn More' page
                 variant="outline"
                 color="secondary" // Use secondary color
                 size="lg"
                 className="px-4"
               >
                 Learn More
               </CButton>
             </div>
           </div>
        </CContainer>
      </main>

      {/* Footer will be added later */}
       {/* <CFooter> ... </CFooter> */}
    </div>
  );
};

export default LandingPage; 