import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import theme from '../utils/theme'; // Assuming theme file path
import { Helmet } from 'react-helmet'; // For meta tags

// Import SVG icons
import SmallAnimalIcon from '../assets/icons/small-animal.svg';
import EquineIcon from '../assets/icons/equine.svg';
import FarmAnimalIcon from '../assets/icons/farm-animal.svg';
import PreventativeCareIcon from '../assets/icons/preventative-care.svg';
import EmergencyIcon from '../assets/icons/emergency.svg';
import DiagnosticsIcon from '../assets/icons/diagnostics.svg';

// Import banner image
import BannerImage from '../assets/images/services-banner.jpg';

const ServicesPage = () => {
  const styles = {
    pageHeader: {
      backgroundColor: theme.colors.background.light,
      padding: '4rem 0',
      marginBottom: '3.5rem',
      textAlign: 'center',
      backgroundImage: `url(${BannerImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      color: theme.colors.text.white,
    },
    headerOverlay: {
      backgroundColor: 'rgba(18, 68, 56, 0.7)', // Using dark green with opacity
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
    },
    headerContent: {
      position: 'relative',
      zIndex: 2,
    },
    headerTitle: {
      color: theme.colors.text.white,
      fontWeight: 'bold',
    },
    section: {
      padding: '3.5rem 0', // Increased from 3rem to 3.5rem
    },
    sectionTitle: {
      color: theme.colors.primary.main,
      fontWeight: '600',
      marginBottom: '2rem',
      textAlign: 'center',
    },
    serviceCard: {
      border: 'none',
      boxShadow: theme.shadows.md,
      marginBottom: '2rem',
      height: '100%', // Ensure cards in a row have the same height
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: `${theme.colors.background.light}20`, // Light background with reduced opacity
      borderLeft: `4px solid ${theme.colors.primary.main}`, // Left accent border
      transition: 'all 0.2s ease-in-out', // Smooth transition for hover effect
    },
    serviceCardHover: {
      transform: 'translateY(-3px)',
      boxShadow: theme.shadows.lg,
    },
    cardBody: {
      flexGrow: 1, // Make body take available space
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between', // Push button to bottom
    },
    iconWrapper: {
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem auto',
    },
    learnMoreButton: {
      backgroundColor: theme.colors.secondary.main,
      borderColor: theme.colors.secondary.main,
      marginTop: '1rem',
      transition: 'all 0.2s ease-in-out',
    },
    learnMoreButtonHover: {
      backgroundColor: theme.colors.secondary.dark,
      borderColor: theme.colors.secondary.dark,
      transform: 'scale(1.05)', 
    },
    howItWorksIcon: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: `${theme.colors.primary.light}30`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem auto',
      fontSize: '1.8rem',
      color: theme.colors.primary.main,
    },
    stepCard: {
      textAlign: 'center',
      padding: '1.5rem',
    },
    stepNumber: {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.text.white,
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem auto',
      fontWeight: 'bold',
    },
  };

  const services = [
    {
      icon: <img src={SmallAnimalIcon} alt="Icon depicting dogs and cats for small animal care services" />,
      title: 'Small Animal Care',
      description: 'Comprehensive health services for dogs, cats, rabbits, and other household pets, including wellness exams, vaccinations, diagnostics, and minor procedures, all in the familiar environment of your home.',
      link: '/search-providers?animalType=Small%20Animal',
    },
    {
      icon: <img src={EquineIcon} alt="Horse icon representing equine veterinary services" />,
      title: 'Equine Services',
      description: 'Specialized veterinary care for horses, covering routine checkups, dental floating, lameness evaluations, pre-purchase exams, vaccinations, and emergency field services for stables and private owners.',
      link: '/search-providers?animalType=Equine',
    },
    {
      icon: <img src={FarmAnimalIcon} alt="Farm animal icon showing livestock veterinary care" />,
      title: 'Farm Animal Care',
      description: 'On-site veterinary services for cattle, sheep, goats, pigs, and other livestock. We offer herd health management, reproductive services, sick animal exams, and preventative care tailored to your farm\'s needs.',
      link: '/search-providers?animalType=Large%20Animal',
    },
    {
      icon: <img src={PreventativeCareIcon} alt="Shield icon representing preventative veterinary care" />,
      title: 'Preventative Care',
      description: 'Proactive health management including vaccinations, parasite control (flea, tick, heartworm), nutritional counseling, and routine health screenings to keep your animals healthy and prevent future issues.',
      link: '/search-providers?specialtyServices=Preventative',
    },
    {
      icon: <img src={EmergencyIcon} alt="Cross icon representing emergency veterinary services" />,
      title: 'Emergency Services',
      description: 'Urgent care availability for critical situations. Connect with providers offering emergency response for injuries, acute illnesses, and other immediate veterinary needs outside of regular hours (subject to provider availability).',
      link: '/search-providers?specialtyServices=Emergency',
    },
    {
      icon: <img src={DiagnosticsIcon} alt="Microscope icon representing diagnostic laboratory services" />,
      title: 'Diagnostics & Lab Work',
      description: 'Mobile diagnostic capabilities including sample collection for blood work, urinalysis, fecal exams, and coordination with labs for comprehensive testing to aid in accurate diagnosis and treatment planning.',
      link: '/search-providers?specialtyServices=Diagnostics',
    },
  ];

  const howItWorksSteps = [
    {
      icon: '🔍',
      title: 'Find a Service',
      description: 'Browse our range of veterinary services and find the care your animal needs.',
    },
    {
      icon: '📅',
      title: 'Book an Appointment',
      description: 'Schedule a convenient time for a veterinarian to visit your location.',
    },
    {
      icon: '🏡',
      title: 'Receive Care',
      description: 'Get professional veterinary care delivered right to your doorstep.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Veterinary Services | Visiting Vet</title>
        <meta name="description" content="Professional mobile veterinary services including small animal care, equine services, farm animal care, preventative care, emergency services, and diagnostics." />
        <meta property="og:title" content="Mobile Veterinary Services | Visiting Vet" />
        <meta property="og:description" content="Quality veterinary care delivered to your doorstep." />
      </Helmet>

      <div style={styles.pageHeader} role="banner">
        <div style={styles.headerOverlay}></div>
        <Container style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Our Mobile Veterinary Services</h1>
          <p className="lead">Comprehensive care delivered to your doorstep.</p>
        </Container>
      </div>

      <Container style={styles.section} role="region" aria-labelledby="how-it-works-heading">
        <h2 id="how-it-works-heading" style={styles.sectionTitle}>How It Works</h2>
        <Row>
          {howItWorksSteps.map((step, index) => (
            <Col md={4} key={index}>
              <div style={styles.stepCard}>
                <div style={styles.stepNumber}>{index + 1}</div>
                <div className="how-it-works-icon" style={styles.howItWorksIcon} aria-hidden="true">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      <Container style={styles.section} role="region" aria-labelledby="services-heading">
        <h2 id="services-heading" style={styles.sectionTitle}>What We Offer</h2>
        <Row>
          {services.map((service, index) => (
            <Col md={6} lg={4} key={index}>
              <Card 
                style={styles.serviceCard} 
                className="service-card"
                tabIndex="0" // Make card focusable for keyboard navigation
              >
                <Card.Body style={styles.cardBody}>
                  <div>
                    <div style={styles.iconWrapper} className="service-icon">{service.icon}</div>
                    <Card.Title className="text-center">{service.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {service.description}
                    </Card.Text>
                  </div>
                  <div className="text-center">
                     <Button 
                       as={Link} 
                       to={service.link} 
                       style={styles.learnMoreButton}
                       className="cta-button"
                       aria-label={`Find ${service.title} Providers`}
                     >
                       Find Providers
                     </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* CSS for hover effects */}
      <style jsx>{`
        .service-card:hover {
          transform: translateY(-3px);
          box-shadow: ${theme.shadows.lg};
        }
        
        .cta-button:hover {
          background-color: ${theme.colors.secondary.dark} !important;
          border-color: ${theme.colors.secondary.dark} !important;
          transform: scale(1.05);
        }
        
        .service-icon img {
          width: 48px;
          height: 48px;
          filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1));
          transition: transform 0.3s ease;
        }
        
        .service-card:hover .service-icon img {
          transform: scale(1.1);
        }
        
        .how-it-works-icon {
          transition: all 0.3s ease;
        }
        
        .how-it-works-icon:hover {
          transform: scale(1.15);
          background-color: ${theme.colors.primary.light}60;
        }
        
        @media (max-width: ${theme.breakpoints.md}) {
          .service-card {
            margin-bottom: 1.5rem;
          }
        }
        
        @media (max-width: ${theme.breakpoints.sm}) {
          h1 {
            font-size: 2rem;
          }
          
          h2 {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </>
  );
};

export default ServicesPage; 