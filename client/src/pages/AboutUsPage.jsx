import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import theme from '../utils/theme'; // Assuming theme file path
import { motion } from 'framer-motion';
import './AboutUsPage.css'; // Add CSS file for additional styles

const AboutUsPage = () => {
  // Add effect to respect user's motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      // Apply styles for reduced motion
      document.documentElement.style.setProperty('--transition-duration', '0.01ms');
    }
  }, []);

  const styles = {
    pageHeader: {
      background: `linear-gradient(to right, ${theme.colors.primary.light}, ${theme.colors.primary.light}30)`,
      padding: '6rem 0',
      marginBottom: '3rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    headerTitle: {
      color: theme.colors.primary.dark,
      fontWeight: 'bold',
      fontSize: '3.5rem',
      letterSpacing: '-0.5px',
    },
    decorativeElement: {
      position: 'absolute',
      right: '5%',
      top: '20%',
      width: '150px',
      height: '150px',
      opacity: 0.2,
      background: `url('/assets/images/landing-page/hero-bg.jpg')`,
      backgroundSize: 'cover',
      borderRadius: '50%',
      zIndex: 0,
    },
    divider: {
      width: '60px',
      height: '3px',
      backgroundColor: theme.colors.primary.main,
      margin: '1rem auto',
    },
    section: {
      padding: '3rem 0',
    },
    sectionTitle: {
      color: theme.colors.primary.main,
      fontWeight: 'bold',
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
      <div style={styles.pageHeader} role="banner" aria-labelledby="page-title">
        <div style={styles.decorativeElement} aria-hidden="true"></div>
        <Container>
          <h1 style={styles.headerTitle} id="page-title">About VisitingVet</h1>
          <div style={styles.divider} aria-hidden="true"></div>
          <motion.p 
            className="lead text-muted subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Connecting pets and vets, wherever you are.
          </motion.p>
        </Container>
      </div>

      <Container>
        {/* Mission Section */}
        <section style={styles.section} aria-labelledby="mission-title">
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h2 style={{ color: theme.colors.primary.dark }} id="mission-title">Our Mission</h2>
              <div className="pull-quote" style={{ 
                borderLeft: `4px solid ${theme.colors.primary.main}`, 
                padding: '0.5rem 0 0.5rem 1rem',
                margin: '1.5rem 0',
                fontStyle: 'italic',
                fontWeight: '500'
              }}>
                Every animal deserves quality care in the comfort of their own environment.
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.2 }}
                viewport={{ once: true }}
              >
                <motion.p 
                  className="text-muted"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  style={{ marginBottom: '32px' }}
                >
                  At VisitingVet, our mission is to revolutionize pet healthcare by making quality veterinary services accessible, convenient, and stress-free. We believe that every animal deserves the best care possible, right in the comfort of their own home or farm.
                </motion.p>
                <motion.p 
                  className="text-muted"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  We connect dedicated mobile veterinary professionals with pet owners and farmers, simplifying the process of finding, booking, and receiving expert care for animals of all shapes and sizes.
                </motion.p>
              </motion.div>
            </Col>
            <Col md={6}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image 
                  src="/assets/images/landing-page/about-mission.jpg" 
                  alt="Veterinarian caring for a dog at home" 
                  fluid 
                  rounded 
                  style={{ 
                    boxShadow: theme.shadows.sm,
                    border: `1px solid ${theme.colors.neutral[300]}`
                  }}
                />
              </motion.div>
            </Col>
          </Row>
        </section>

        {/* Values Section */}
        <section style={styles.section} aria-labelledby="values-title">
          <h2 style={styles.sectionTitle} id="values-title">Our Values</h2>
          <Row>
            <Col md={4}>
              <motion.div
                whileHover={{ y: -8, boxShadow: theme.shadows.md }}
                transition={{ duration: 0.3 }}
                className="value-card"
              >
                <Card 
                  style={{
                    ...styles.cardStyle, 
                    backgroundColor: `${theme.colors.primary.main}10`,
                    borderRadius: '12px'
                  }} 
                  className="text-center"
                >
                  <Card.Body>
                    <motion.div 
                      style={styles.iconWrapper}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      aria-hidden="true"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.5 18.5L9.5 12.5L13.5 16.5L22 6.92L20.59 5.5L13.5 13.5L9.5 9.5L2 17L3.5 18.5Z" fill={theme.colors.primary.main}/>
                      </svg>
                    </motion.div>
                    <Card.Title>Compassion</Card.Title>
                    <Card.Text className="text-muted">
                      We prioritize the well-being and comfort of every animal we serve.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={4}>
              <motion.div
                whileHover={{ y: -8, boxShadow: theme.shadows.md }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  style={{
                    ...styles.cardStyle, 
                    backgroundColor: `${theme.colors.primary.main}15`,
                    borderRadius: '12px'
                  }}  
                  className="text-center"
                >
                  <Card.Body>
                    <motion.div 
                      style={styles.iconWrapper}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM18 11.09C18 15.09 15.45 18.79 12 19.92C8.55 18.79 6 15.1 6 11.09V6.39L12 4.14L18 6.39V11.09Z" fill={theme.colors.primary.main}/>
                        <path d="M10 13L7 10L5.5 11.5L10 16L18 8L16.5 6.5L10 13Z" fill={theme.colors.primary.main}/>
                      </svg>
                    </motion.div>
                    <Card.Title>Convenience</Card.Title>
                    <Card.Text className="text-muted">
                      Bringing expert veterinary care directly to your doorstep, saving you time and stress.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={4}>
              <motion.div
                whileHover={{ y: -8, boxShadow: theme.shadows.md }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  style={{
                    ...styles.cardStyle, 
                    backgroundColor: `${theme.colors.primary.main}20`,
                    borderRadius: '12px'
                  }}  
                  className="text-center"
                >
                  <Card.Body>
                    <motion.div 
                      style={styles.iconWrapper}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM19 11C19 15.52 15.87 19.72 12 20.94C8.13 19.72 5 15.52 5 11V6.3L12 3.19L19 6.3V11ZM7.84 9.4L6.4 10.84L10 14.44L17.6 6.84L16.16 5.4L10 11.56L7.84 9.4Z" fill={theme.colors.primary.main}/>
                      </svg>
                    </motion.div>
                    <Card.Title>Trust</Card.Title>
                    <Card.Text className="text-muted">
                      Connecting you with verified, licensed, and experienced veterinary professionals.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </section>
        
        {/* Team Section */}
        <section style={styles.section} aria-labelledby="team-title">
          <h2 style={styles.sectionTitle} id="team-title">Meet the Team</h2>
          <p className="text-center text-muted mb-4">The passionate individuals behind VisitingVet.</p>
          <Row className="g-md-4">
            {[
              {
                name: "Dr. Emily Chen", 
                role: "Chief Veterinary Officer",
                bio: "10+ years specializing in small animal care with a passion for making veterinary visits stress-free.",
                image: "/assets/images/team/emily-chen.jpg" // TODO: Replace placeholder image path
              },
              {
                name: "James Wilson", 
                role: "Operations Director",
                bio: "Logistics expert ensuring our veterinary services reach every corner efficiently and effectively.",
                image: "/assets/images/team/james-wilson.jpg" // TODO: Replace placeholder image path
              },
              {
                name: "Dr. Michael Rodriguez", 
                role: "Large Animal Specialist",
                bio: "Farm animal expert with extensive experience in mobile veterinary services for rural communities.",
                image: "/assets/images/team/michael-rodriguez.jpg" // TODO: Replace placeholder image path
              },
              {
                name: "Sarah Johnson", 
                role: "Customer Relations",
                bio: "Dedicated to ensuring exceptional experiences for both pet owners and veterinary professionals.",
                image: "/assets/images/team/sarah-johnson.jpg" // TODO: Replace placeholder image path
              }
            ].map((member, index) => (
              <Col lg={3} md={6} sm={6} className="mb-4" key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card style={{
                    ...styles.cardStyle,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    height: '100%'
                  }}>
                    <div style={{ position: 'relative' }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          width: '150px',
                          height: '150px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          margin: '2rem auto 1rem',
                          border: `3px solid ${theme.colors.primary.light}`,
                        }}>
                          <Image
                            src={member.image}
                            alt={`${member.name}, ${member.role}`}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                            onError={(e) => {
                              // Add fallback logic if needed
                              e.target.onerror = null; // Prevents infinite loop
                              e.target.src = '/assets/images/team/default-avatar.png'; // TODO: Define default avatar path
                            }}
                          />
                        </div>
                      </motion.div>
                    </div>
                    <Card.Body className="text-center">
                      <Card.Title className="mb-1">{member.name}</Card.Title>
                      <p className="text-muted subtitle mb-2">{member.role}</p>
                      <Card.Text className="text-muted">
                        {member.bio}
                      </Card.Text>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ marginTop: '1rem' }}
                      >
                        <a href="#" className="text-primary me-2">
                          <i className="fas fa-envelope"></i>
                        </a>
                        <a href="#" className="text-primary">
                          <i className="fas fa-user"></i>
                        </a>
                      </motion.div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-4">
            <a href="#" className="btn btn-primary">View All Team</a>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section style={{ ...styles.section, backgroundColor: '#f8f9fa', padding: '4rem 0', borderRadius: '12px', margin: '2rem 0' }} aria-labelledby="testimonials-title">
          <Container>
            <h2 style={styles.sectionTitle} id="testimonials-title">What Our Clients Say</h2>
            
            <div id="testimonialsCarousel" className="carousel slide" data-bs-ride="carousel" aria-roledescription="carousel" aria-label="Client testimonials">
              <div className="carousel-inner">
                {[
                  {
                    quote: "Having the vet come to our home made all the difference for our anxious cat. No more stressful car rides and a much more thorough examination in a comfortable environment.",
                    name: "Maria Thompson",
                    pet: "Cat owner",
                    image: "/assets/images/testimonials/maria-thompson.jpg" // TODO: Replace placeholder image path
                  },
                  {
                    quote: "As a farm owner, having mobile veterinary services has been transformative. The convenience of on-site care for our animals has saved us countless hours of transport time.",
                    name: "Robert Johnson",
                    pet: "Farm owner",
                    image: "/assets/images/testimonials/robert-johnson.jpg" // TODO: Replace placeholder image path
                  },
                  {
                    quote: "Our elderly dog has mobility issues, and taking him to a clinic was becoming increasingly difficult. VisitingVet's at-home service has been a blessing for both him and us.",
                    name: "Sarah Davis",
                    pet: "Dog owner",
                    image: "/assets/images/testimonials/sarah-davis.jpg" // TODO: Replace placeholder image path
                  }
                ].map((testimonial, index) => (
                  <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={index}>
                    <Card className="testimonial-card" style={{
                      border: 'none', 
                      boxShadow: theme.shadows.md,
                      margin: '0 auto',
                      borderRadius: '12px',
                      position: 'relative',
                      padding: '2rem'
                    }}>
                      <Card.Body className="text-center">
                        <div style={{ 
                          fontSize: '4rem', 
                          lineHeight: '1',
                          color: theme.colors.primary.light,
                          opacity: 0.3,
                          position: 'absolute',
                          top: '10px',
                          left: '20px'
                        }}>❝</div>
                        <p className="lead mb-4 px-md-5" style={{ position: 'relative', zIndex: 1 }}>
                          {testimonial.quote}
                        </p>
                        <div className="d-flex align-items-center justify-content-center">
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            marginRight: '15px'
                          }}>
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div className="text-start">
                            <h5 className="mb-0">{testimonial.name}</h5>
                            <p className="text-muted small mb-0">{testimonial.pet}</p>
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: '4rem', 
                          lineHeight: '1',
                          color: theme.colors.primary.light,
                          opacity: 0.3,
                          position: 'absolute',
                          bottom: '10px',
                          right: '20px'
                        }}>❞</div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-center mt-4">
                <button className="btn btn-sm btn-primary mx-1 mx-sm-2" type="button" data-bs-target="#testimonialsCarousel" data-bs-slide="prev" aria-label="Previous testimonial">
                  <i className="fas fa-chevron-left" aria-hidden="true"></i>
                </button>
                <button className="btn btn-sm btn-primary mx-1 mx-sm-2" type="button" data-bs-target="#testimonialsCarousel" data-bs-slide="next" aria-label="Next testimonial">
                  <i className="fas fa-chevron-right" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            
            <div className="text-center mt-5">
              <a href="#" className="btn btn-primary">Share Your Experience</a>
            </div>
          </Container>
        </section>
        
        {/* Statistics Section */}
        <section style={{ ...styles.section, margin: '3rem 0' }} aria-labelledby="stats-title">
          <Container>
            <h2 style={styles.sectionTitle} id="stats-title">Our Impact</h2>
            <Row className="justify-content-center">
              {[
                {
                  number: "5,000+", // TODO: Replace placeholder value
                  label: "Home Visits",
                  icon: (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22L12 3Z" fill={theme.colors.primary.main}/>
                    </svg>
                  )
                },
                {
                  number: "450+", // TODO: Replace placeholder value
                  label: "Veterinary Experts",
                  icon: (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3ZM18.82 9L12 12.72L5.18 9L12 5.28L18.82 9ZM17 16L12 18.72L7 16V12.27L12 15L17 12.27V16Z" fill={theme.colors.primary.main}/>
                    </svg>
                  )
                },
                {
                  number: "98%", // TODO: Replace placeholder value
                  label: "Client Satisfaction",
                  icon: (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill={theme.colors.primary.main}/>
                    </svg>
                  )
                }
              ].map((stat, index) => (
                <Col lg={4} md={4} sm={12} className="mb-4" key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card style={{ ...styles.cardStyle, backgroundColor: '#fff', border: `1px solid ${theme.colors.neutral[200]}` }} className="text-center">
                      <Card.Body style={{ padding: '2rem' }}>
                        <div style={styles.iconWrapper}>
                          {stat.icon}
                        </div>
                        {/* TODO: Implement count-up animation for stat number */}
                        <h3 style={{ color: theme.colors.primary.dark, fontWeight: 'bold' }}>{stat.number}</h3> 
                        <p className="text-muted mb-0">{stat.label}</p>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
        
        {/* Call-to-Action Section */}
        <section style={{
          background: `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark})`,
          padding: '5rem 0',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          marginTop: '3rem'
        }} aria-labelledby="cta-title" className="cta-section">
          <div className="cta-decoration" aria-hidden="true" style={{
            top: '-10%',
            right: '-5%',
            width: '300px',
            height: '300px'
          }}></div>
          <div className="cta-decoration" aria-hidden="true" style={{
            bottom: '-20%',
            left: '-5%',
            width: '400px',
            height: '400px'
          }}></div>
          
          <Container className="position-relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="display-4 mb-3" style={{ color: 'white', fontWeight: 'bold' }} id="cta-title">Ready to Experience the Difference?</h2>
              <p className="lead mb-5" style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '800px', margin: '0 auto' }}>
                Join thousands of pet owners who've discovered the convenience and quality of mobile veterinary care.
              </p>
              <div>
                <a href="#" className="btn btn-light btn-lg me-3 mb-3 mb-md-0 px-4 py-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                    <path d="M19 4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V6H19V20Z" fill={theme.colors.primary.main}/>
                    <path d="M7 9H17V11H7V9ZM7 13H17V15H7V13Z" fill={theme.colors.primary.main}/>
                  </svg>
                  Book a Visit
                </a>
                <a href="#" className="btn btn-outline-light btn-lg px-4 py-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                    <path d="M10.01 21.01C10.01 21.56 9.56 22.01 9.01 22.01C8.46 22.01 8.01 21.56 8.01 21.01C8.01 20.46 8.46 20.01 9.01 20.01C9.56 20.01 10.01 20.46 10.01 21.01Z" fill="white"/>
                    <path d="M15.01 21.01C15.01 21.56 14.56 22.01 14.01 22.01C13.46 22.01 13.01 21.56 13.01 21.01C13.01 20.46 13.46 20.01 14.01 20.01C14.56 20.01 15.01 20.46 15.01 21.01Z" fill="white"/>
                    <path d="M22.8 12.63L21.01 8H6.83L6 3.87C5.86 3.36 5.39 3 4.86 3H2V5H4.03L7.18 15.88C7.32 16.39 7.79 16.75 8.33 16.75H18V14.75H8.93L8.57 13.5H18.3C18.82 13.5 19.27 13.16 19.43 12.67L22.78 3.89L21.03 3.11L18.29 10.5H8.01L7.02 7H19.82L21.23 10.63C21.72 11.63 21.72 11.63 22.8 12.63Z" fill="white"/>
                  </svg>
                  Join as Vet
                </a>
              </div>
            </motion.div>
          </Container>
        </section>
      </Container>
    </>
  );
};

export default AboutUsPage; 