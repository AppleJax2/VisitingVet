import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import theme from '../utils/theme'; // Assuming theme file path

const ServicesPage = () => {
  const styles = {
    pageHeader: {
      backgroundColor: theme.colors.background.light,
      padding: '4rem 0',
      marginBottom: '3rem',
      textAlign: 'center',
    },
    headerTitle: {
      color: theme.colors.primary.dark,
      fontWeight: 'bold',
    },
    section: {
      padding: '3rem 0',
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
    },
    cardBody: {
      flexGrow: 1, // Make body take available space
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between', // Push button to bottom
    },
    iconWrapper: {
      backgroundColor: `${theme.colors.primary.main}20`, // Lighter primary
      color: theme.colors.primary.main,
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem auto',
      fontSize: '1.8rem',
    },
    learnMoreButton: {
      backgroundColor: theme.colors.secondary.main,
      borderColor: theme.colors.secondary.main,
      marginTop: '1rem',
    }
  };

  const services = [
    {
      icon: '🐕', // Using emoji, could be react-bootstrap-icons
      title: 'Small Animal Care',
      description: 'Comprehensive health services for dogs, cats, rabbits, and other household pets, including wellness exams, vaccinations, diagnostics, and minor procedures, all in the familiar environment of your home.',
      link: '/search-providers?animalType=Small%20Animal',
    },
    {
      icon: '🐎', // Using emoji
      title: 'Equine Services',
      description: 'Specialized veterinary care for horses, covering routine checkups, dental floating, lameness evaluations, pre-purchase exams, vaccinations, and emergency field services for stables and private owners.',
      link: '/search-providers?animalType=Equine',
    },
    {
      icon: '🐄', // Using emoji
      title: 'Farm Animal Care',
      description: 'On-site veterinary services for cattle, sheep, goats, pigs, and other livestock. We offer herd health management, reproductive services, sick animal exams, and preventative care tailored to your farm\'s needs.',
      link: '/search-providers?animalType=Large%20Animal',
    },
    {
      icon: '💉', // Using emoji
      title: 'Preventative Care',
      description: 'Proactive health management including vaccinations, parasite control (flea, tick, heartworm), nutritional counseling, and routine health screenings to keep your animals healthy and prevent future issues.',
      link: '/search-providers?specialtyServices=Preventative',
    },
    {
      icon: '🚑', // Using emoji
      title: 'Emergency Services',
      description: 'Urgent care availability for critical situations. Connect with providers offering emergency response for injuries, acute illnesses, and other immediate veterinary needs outside of regular hours (subject to provider availability).',
      link: '/search-providers?specialtyServices=Emergency',
    },
    {
      icon: '🔬', // Using emoji
      title: 'Diagnostics & Lab Work',
      description: 'Mobile diagnostic capabilities including sample collection for blood work, urinalysis, fecal exams, and coordination with labs for comprehensive testing to aid in accurate diagnosis and treatment planning.',
      link: '/search-providers?specialtyServices=Diagnostics',
    },
  ];

  return (
    <>
      <div style={styles.pageHeader}>
        <Container>
          <h1 style={styles.headerTitle}>Our Mobile Veterinary Services</h1>
          <p className="lead text-muted">Comprehensive care delivered to your doorstep.</p>
        </Container>
      </div>

      <Container style={styles.section}>
        <h2 style={styles.sectionTitle}>What We Offer</h2>
        <Row>
          {services.map((service, index) => (
            <Col md={6} lg={4} key={index}>
              <Card style={styles.serviceCard}>
                <Card.Body style={styles.cardBody}>
                  <div>
                    <div style={styles.iconWrapper}>{service.icon}</div>
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
    </>
  );
};

export default ServicesPage; 