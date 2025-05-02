import React from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';

const AboutUsPage = () => {
  return (
    <>
      <div className="bg-primary-subtle p-5 mb-5 text-center" role="banner" aria-labelledby="page-title">
        <Container>
          <h1 className="text-primary-emphasis fw-bold display-4" id="page-title">About VisitingVet</h1>
          <hr className="border-primary border-2 opacity-100 mx-auto" style={{ width: '60px' }} />
          <p className="lead text-muted">
            Connecting pets and vets, wherever you are.
          </p>
        </Container>
      </div>

      <Container>
        <section className="py-5" aria-labelledby="mission-title">
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h2 className="text-primary-dark" id="mission-title">Our Mission</h2>
              <blockquote className="blockquote border-start border-primary border-4 ps-3 my-4 fst-italic fw-medium">
                Every animal deserves quality care in the comfort of their own environment.
              </blockquote>
              <div>
                <p className="text-muted mb-4">
                  At VisitingVet, our mission is to revolutionize pet healthcare by making quality veterinary services accessible, convenient, and stress-free. We believe that every animal deserves the best care possible, right in the comfort of their own home or farm.
                </p>
                <p className="text-muted">
                  We connect dedicated mobile veterinary professionals with pet owners and farmers, simplifying the process of finding, booking, and receiving expert care for animals of all shapes and sizes.
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div>
                <Image
                  src="/assets/images/landing-page/about-mission.jpg"
                  alt="Veterinarian caring for a dog at home"
                  fluid
                  rounded
                  className="shadow-sm border border-light-subtle"
                />
              </div>
            </Col>
          </Row>
        </section>

        <section className="py-5" aria-labelledby="values-title">
          <h2 className="text-primary fw-bold mb-4 text-center" id="values-title">Our Values</h2>
          <Row>
            <Col md={4}>
              <Card className="text-center mb-4 shadow-hover border-0" style={{ backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)', borderRadius: '12px' }}>
                <Card.Body>
                  <div
                    className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '60px', height: '60px', fontSize: '1.8rem' }}
                    aria-hidden="true"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.5 18.5L9.5 12.5L13.5 16.5L22 6.92L20.59 5.5L13.5 13.5L9.5 9.5L2 17L3.5 18.5Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <Card.Title>Compassion</Card.Title>
                  <Card.Text className="text-muted">
                    We prioritize the well-being and comfort of every animal we serve.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="text-center mb-4 shadow-hover border-0" style={{ backgroundColor: 'rgba(var(--bs-success-rgb), 0.1)', borderRadius: '12px' }}
              >
                <Card.Body>
                  <div
                    className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '60px', height: '60px', fontSize: '1.8rem' }}
                    aria-hidden="true"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
                    </svg>
                  </div>
                  <Card.Title>Accessibility</Card.Title>
                  <Card.Text className="text-muted">
                    Bringing expert veterinary care directly to your doorstep, saving you time and stress.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="text-center mb-4 shadow-hover border-0" style={{ backgroundColor: 'rgba(var(--bs-info-rgb), 0.1)', borderRadius: '12px' }}
              >
                <Card.Body>
                  <div
                    className="bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '60px', height: '60px', fontSize: '1.8rem' }}
                    aria-hidden="true"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.4.05-.61zm3.5.5c0 .17-.01.33-.04.5l1.86 1.86c.4-.91.68-1.92.68-3.02 0-3.36-2.17-6.25-5.04-7.43v2.1C18.98 7.12 20 9.36 20 12.5zM4.27 4L3 5.27l4.73 4.73V11c0 1.77 1.02 3.29 2.5 4.03v4.47l2.5 2.5 1.27-1.27L4.27 4zm8.23 8.27L10 10.04v.96c0 .61-.02.81-.05 1.01l2.23 2.23z" fill="currentColor"/>
                    </svg>
                  </div>
                  <Card.Title>Trust</Card.Title>
                  <Card.Text className="text-muted">
                    Connecting you with verified, licensed, and experienced veterinary professionals.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>
        
        <section className="py-5 bg-light rounded-3" aria-labelledby="team-title">
          <h2 className="text-primary fw-bold mb-5 text-center" id="team-title">Meet the Team</h2>
          <p className="text-center text-muted mb-4">The passionate individuals behind VisitingVet.</p>
          <Row className="justify-content-center">
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
              <Col md={4} className="text-center mb-4" key={index}>
                <Image src={member.image} roundedCircle width={150} height={150} className="mb-3 shadow" />
                <h5 className="fw-bold">{member.name}</h5>
                <p className="text-muted subtitle mb-2">{member.role}</p>
                <Card.Text className="text-muted">
                  {member.bio}
                </Card.Text>
                <div>
                  <a href="#" className="text-primary me-2">
                    <i className="fas fa-envelope"></i>
                  </a>
                  <a href="#" className="text-primary">
                    <i className="fas fa-user"></i>
                  </a>
                </div>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-4">
            <a href="#" className="btn btn-primary">View All Team</a>
          </div>
        </section>
        
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
                </Col>
              ))}
            </Row>
          </Container>
        </section>
        
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
            <div
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
            </div>
          </Container>
        </section>
      </Container>
    </>
  );
};

export default AboutUsPage; 