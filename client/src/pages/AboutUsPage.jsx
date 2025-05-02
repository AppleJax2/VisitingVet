import React from 'react';
import { Container, Row, Col, Card, Image, Button } from 'react-bootstrap';

const AboutUsPage = () => {
  return (
    <>
      <div className="bg-light p-5 mb-4 text-center position-relative overflow-hidden" role="banner" aria-labelledby="page-title">
        <Container>
          <h1 className="display-4 fw-bold text-primary" id="page-title">About VisitingVet</h1>
          <hr className="my-4 mx-auto" style={{ width: '60px', borderTop: '3px solid var(--bs-primary)' }} aria-hidden="true" />
          <p className="lead text-muted">
            Connecting pets and vets, wherever you are.
          </p>
        </Container>
      </div>

      <Container>
        <section className="py-5" aria-labelledby="mission-title">
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h2 className="text-dark" id="mission-title">Our Mission</h2>
              <figure className="mt-4 mb-4">
                <blockquote className="blockquote fs-5" style={{ borderLeft: '4px solid var(--bs-primary)', paddingLeft: '1rem' }}>
                  Every animal deserves quality care in the comfort of their own environment.
                </blockquote>
              </figure>
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
              <Image 
                src="/assets/images/landing-page/about-mission.jpg" 
                alt="Veterinarian caring for a dog at home" 
                fluid 
                rounded 
                className="shadow-sm border"
              />
            </Col>
          </Row>
        </section>

        <section className="py-5" aria-labelledby="values-title">
          <h2 className="text-primary fw-bold mb-4 text-center" id="values-title">Our Values</h2>
          <Row>
            {[
              { title: "Compassion", text: "We prioritize the well-being and comfort of every animal we serve.", iconPlaceholder: "CompassionIcon" },
              { title: "Convenience", text: "Bringing expert veterinary care directly to your doorstep, saving you time and stress.", iconPlaceholder: "ConvenienceIcon" },
              { title: "Trust", text: "Connecting you with verified, licensed, and experienced veterinary professionals.", iconPlaceholder: "TrustIcon" },
            ].map((value, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="text-center shadow-sm border-0 h-100" style={{ backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)', borderRadius: '12px' }}> 
                  <Card.Body className="p-4">
                    <div 
                      className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle mx-auto mb-3" 
                      style={{ width: '60px', height: '60px', fontSize: '1.8rem' }}
                      aria-hidden="true"
                    >
                      <span>Icon</span> 
                    </div>
                    <Card.Title className="fw-bold">{value.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {value.text}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
        
        <section className="py-5" aria-labelledby="team-title">
          <h2 className="text-primary fw-bold mb-2 text-center" id="team-title">Meet the Team</h2>
          <p className="text-center text-muted mb-5">The passionate individuals behind VisitingVet.</p>
          <Row className="g-4">
            {[
              {
                name: "Dr. Emily Chen", 
                role: "Chief Veterinary Officer",
                bio: "10+ years specializing in small animal care with a passion for making veterinary visits stress-free.",
                image: "/assets/images/team/emily-chen.jpg"
              },
              {
                name: "James Wilson", 
                role: "Operations Director",
                bio: "Logistics expert ensuring our veterinary services reach every corner efficiently and effectively.",
                image: "/assets/images/team/james-wilson.jpg"
              },
              {
                name: "Dr. Michael Rodriguez", 
                role: "Large Animal Specialist",
                bio: "Farm animal expert with extensive experience in mobile veterinary services for rural communities.",
                image: "/assets/images/team/michael-rodriguez.jpg"
              },
              {
                name: "Sarah Johnson", 
                role: "Customer Relations",
                bio: "Dedicated to ensuring exceptional experiences for both pet owners and veterinary professionals.",
                image: "/assets/images/team/sarah-johnson.jpg"
              }
            ].map((member, index) => (
              <Col lg={3} md={6} sm={6} className="mb-4 d-flex align-items-stretch" key={index}>
                <Card className="shadow-sm border-0 w-100" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <div className="text-center mt-4">
                     <Image
                        src={member.image}
                        alt={`${member.name}, ${member.role}`}
                        roundedCircle
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          objectFit: 'cover', 
                          border: '3px solid var(--bs-primary-bg-subtle)'
                        }}
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = '/assets/images/team/default-avatar.png';
                        }}
                      />
                  </div>
                  <Card.Body className="text-center d-flex flex-column">
                    <Card.Title className="mb-1 fw-bold">{member.name}</Card.Title>
                    <p className="text-muted small mb-2">{member.role}</p>
                    <Card.Text className="text-muted mb-3">
                      {member.bio}
                    </Card.Text>
                    <div className="mt-auto">
                      <Button variant="link" className="text-primary p-1 me-2"><i className="fas fa-envelope"></i></Button> 
                      <Button variant="link" className="text-primary p-1"><i className="fas fa-user"></i></Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-4">
            <Button variant="primary">View All Team</Button>
          </div>
        </section>
        
        <section className="py-5 bg-light rounded my-4" aria-labelledby="testimonials-title">
          <Container>
            <h2 className="text-primary fw-bold mb-5 text-center" id="testimonials-title">What Our Clients Say</h2>
            
            <div id="testimonialsCarousel" className="carousel slide" data-bs-ride="carousel" aria-roledescription="carousel" aria-label="Client testimonials">
              <div className="carousel-inner">
                {[
                  {
                    quote: "Having the vet come to our home made all the difference for our anxious cat. No more stressful car rides and a much more thorough examination in a comfortable environment.",
                    name: "Maria Thompson",
                    pet: "Cat owner",
                    image: "/assets/images/testimonials/maria-thompson.jpg"
                  },
                  {
                    quote: "As a farm owner, having mobile veterinary services has been transformative. The convenience of on-site care for our animals has saved us countless hours of transport time.",
                    name: "Robert Johnson",
                    pet: "Farm owner",
                    image: "/assets/images/testimonials/robert-johnson.jpg"
                  },
                  {
                    quote: "Our elderly dog has mobility issues, and taking him to a clinic was becoming increasingly difficult. VisitingVet's at-home service has been a blessing for both him and us.",
                    name: "Sarah Davis",
                    pet: "Dog owner",
                    image: "/assets/images/testimonials/sarah-davis.jpg"
                  }
                ].map((testimonial, index) => (
                  <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={index}>
                    <Card className="border-0 shadow-sm mx-auto rounded" style={{ maxWidth: '700px' }}> 
                      <Card.Body className="p-4 p-md-5 text-center position-relative">
                        <p className="lead mb-4">
                          {testimonial.quote}
                        </p>
                        <div className="d-flex align-items-center justify-content-center">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            roundedCircle
                            style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/team/default-avatar.png'; }}
                          />
                          <div className="text-start">
                            <h5 className="mb-0 fw-bold">{testimonial.name}</h5>
                            <p className="text-muted small mb-0">{testimonial.pet}</p>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-center mt-4">
                <Button size="sm" variant="primary" className="mx-1" type="button" data-bs-target="#testimonialsCarousel" data-bs-slide="prev" aria-label="Previous testimonial">
                  <i className="fas fa-chevron-left" aria-hidden="true"></i>
                </Button>
                <Button size="sm" variant="primary" className="mx-1" type="button" data-bs-target="#testimonialsCarousel" data-bs-slide="next" aria-label="Next testimonial">
                  <i className="fas fa-chevron-right" aria-hidden="true"></i>
                </Button>
              </div>
            </div>
            
            <div className="text-center mt-5">
              <Button variant="primary">Share Your Experience</Button>
            </div>
          </Container>
        </section>
        
        <section className="py-5 my-4" aria-labelledby="stats-title">
          <Container>
            <h2 className="text-primary fw-bold mb-5 text-center" id="stats-title">Our Impact</h2>
            <Row className="justify-content-center g-4">
              {[
                {
                  number: "5,000+",
                  label: "Home Visits",
                  iconPlaceholder: "HomeIcon"
                },
                {
                  number: "450+",
                  label: "Veterinary Experts",
                  iconPlaceholder: "VetIcon"
                },
                {
                  number: "98%",
                  label: "Client Satisfaction",
                  iconPlaceholder: "StarIcon"
                }
              ].map((stat, index) => (
                <Col lg={4} md={4} sm={12} key={index}>
                   <Card className="text-center shadow-sm border rounded h-100"> 
                      <Card.Body className="p-4">
                        <div 
                          className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle mx-auto mb-3" 
                          style={{ width: '60px', height: '60px', fontSize: '1.8rem' }}
                          aria-hidden="true"
                        >
                           <span>Icon</span> 
                        </div>
                        <h3 className="text-dark fw-bold">{stat.number}</h3> 
                        <p className="text-muted mb-0">{stat.label}</p>
                      </Card.Body>
                    </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
        
        <section 
          className="py-5 mt-4 text-white position-relative overflow-hidden cta-section" 
          style={{ background: 'linear-gradient(135deg, var(--bs-primary), var(--bs-primary-dark))' }}
          aria-labelledby="cta-title"
        >
          <Container className="position-relative text-center">
            <div>
              <h2 className="display-4 mb-3 fw-bold" id="cta-title">Ready to Experience the Difference?</h2>
              <p className="lead mb-5 mx-auto" style={{ maxWidth: '800px', color: 'rgba(255, 255, 255, 0.9)' }}>
                Join thousands of pet owners who've discovered the convenience and quality of mobile veterinary care.
              </p>
              <div>
                <Button variant="light" size="lg" className="me-3 mb-3 mb-md-0 px-4 py-2 text-primary">
                   <i className="fas fa-calendar-alt me-2"></i>
                  Book a Visit
                </Button>
                <Button variant="outline-light" size="lg" className="px-4 py-2">
                   <i className="fas fa-user-md me-2"></i>
                  Join as Vet
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </Container>
    </>
  );
};

export default AboutUsPage; 