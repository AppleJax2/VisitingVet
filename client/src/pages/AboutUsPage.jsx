import React from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import theme from '../utils/theme'; // Assuming theme file path

const AboutUsPage = () => {
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
    cardStyle: {
      border: 'none',
      boxShadow: theme.shadows.md,
      marginBottom: '2rem',
    },
    iconWrapper: {
      backgroundColor: theme.colors.primary.light,
      color: theme.colors.primary.main,
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem auto',
      fontSize: '1.8rem',
    }
  };

  return (
    <>
      <div style={styles.pageHeader}>
        <Container>
          <h1 style={styles.headerTitle}>About VisitingVet</h1>
          <p className="lead text-muted">Connecting pets and vets, wherever you are.</p>
        </Container>
      </div>

      <Container>
        {/* Mission Section */}
        <section style={styles.section}>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h2 style={{ color: theme.colors.primary.dark }}>Our Mission</h2>
              <p className="text-muted">
                At VisitingVet, our mission is to revolutionize pet healthcare by making quality veterinary services accessible, convenient, and stress-free. We believe that every animal deserves the best care possible, right in the comfort of their own home or farm.
              </p>
              <p className="text-muted">
                We connect dedicated mobile veterinary professionals with pet owners and farmers, simplifying the process of finding, booking, and receiving expert care for animals of all shapes and sizes.
              </p>
            </Col>
            <Col md={6}>
              <Image 
                src="/assets/images/landing-page/about-mission.jpg" 
                alt="Veterinarian caring for a dog at home" 
                fluid 
                rounded 
                style={{ boxShadow: theme.shadows.sm }}
              />
            </Col>
          </Row>
        </section>

        {/* Values Section */}
        <section style={styles.section} className="bg-light rounded p-5">
          <h2 style={styles.sectionTitle}>Our Values</h2>
          <Row>
            <Col md={4}>
              <Card style={styles.cardStyle} className="text-center">
                <Card.Body>
                  <div style={styles.iconWrapper}>🩺</div>
                  <Card.Title>Compassion</Card.Title>
                  <Card.Text className="text-muted">
                    We prioritize the well-being and comfort of every animal we serve.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card style={styles.cardStyle} className="text-center">
                <Card.Body>
                  <div style={styles.iconWrapper}>✅</div>
                  <Card.Title>Convenience</Card.Title>
                  <Card.Text className="text-muted">
                    Bringing expert veterinary care directly to your doorstep, saving you time and stress.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card style={styles.cardStyle} className="text-center">
                <Card.Body>
                  <div style={styles.iconWrapper}>🤝</div>
                  <Card.Title>Trust</Card.Title>
                  <Card.Text className="text-muted">
                    Connecting you with verified, licensed, and experienced veterinary professionals.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>
        
        {/* Placeholder Team Section - Add later if needed */}
        {/* <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Meet the Team</h2>
          <p className="text-center text-muted mb-4">The passionate individuals behind VisitingVet.</p>
          <Row>
            {/* Add Team Member Cards here *}
          </Row>
        </section> */}

      </Container>
    </>
  );
};

export default AboutUsPage; 