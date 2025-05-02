import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const ServicesPage = () => {
  const services = [
    {
      iconPlaceholder: '🐾',
      title: 'Small Animal Care',
      description: 'Comprehensive health services for dogs, cats, rabbits, and other household pets, including wellness exams, vaccinations, diagnostics, and minor procedures, all in the familiar environment of your home.',
      link: '/search-providers?animalType=Small%20Animal',
    },
    {
      iconPlaceholder: '🐎',
      title: 'Equine Services',
      description: 'Specialized veterinary care for horses, covering routine checkups, dental floating, lameness evaluations, pre-purchase exams, vaccinations, and emergency field services for stables and private owners.',
      link: '/search-providers?animalType=Equine',
    },
    {
      iconPlaceholder: '🐄',
      title: 'Farm Animal Care',
      description: 'On-site veterinary services for cattle, sheep, goats, pigs, and other livestock. We offer herd health management, reproductive services, sick animal exams, and preventative care tailored to your farm\'s needs.',
      link: '/search-providers?animalType=Large%20Animal',
    },
    {
      iconPlaceholder: '🛡️',
      title: 'Preventative Care',
      description: 'Proactive health management including vaccinations, parasite control (flea, tick, heartworm), nutritional counseling, and routine health screenings to keep your animals healthy and prevent future issues.',
      link: '/search-providers?specialtyServices=Preventative',
    },
    {
      iconPlaceholder: '➕',
      title: 'Emergency Services',
      description: 'Urgent care availability for critical situations. Connect with providers offering emergency response for injuries, acute illnesses, and other immediate veterinary needs outside of regular hours (subject to provider availability).',
      link: '/search-providers?specialtyServices=Emergency',
    },
    {
      iconPlaceholder: '🔬',
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

      <div 
        className="py-5 mb-5 text-center text-white bg-primary position-relative" 
        role="banner"
      >
        <Container className="position-relative">
          <h1 className="display-4 fw-bold">Our Mobile Veterinary Services</h1>
          <p className="lead">Comprehensive care delivered to your doorstep.</p>
        </Container>
      </div>

      <Container className="py-5" role="region" aria-labelledby="how-it-works-heading">
        <h2 id="how-it-works-heading" className="text-primary fw-bold mb-5 text-center">How It Works</h2>
        <Row className="text-center">
          {howItWorksSteps.map((step, index) => (
            <Col md={4} key={index} className="mb-4">
               <Badge pill bg="primary" className="fs-5 mb-3 px-2">{index + 1}</Badge>
               <div className="mb-3 fs-1" aria-hidden="true">{step.icon}</div>
               <h3 className="h5 fw-bold mb-2">{step.title}</h3>
               <p className="text-muted">{step.description}</p>
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="py-5" role="region" aria-labelledby="services-heading">
        <h2 id="services-heading" className="text-primary fw-bold mb-5 text-center">What We Offer</h2>
        <Row xs={1} md={2} lg={3} className="g-4">
          {services.map((service, index) => (
            <Col key={index} className="d-flex align-items-stretch">
              <Card className="shadow-sm border-0 h-100 w-100" style={{ borderLeft: '4px solid var(--bs-primary)' }}>
                <Card.Body className="d-flex flex-column p-4">
                  <div className="flex-grow-1">
                    <div 
                      className="mb-3 text-center fs-1"
                      aria-hidden="true" 
                    >
                      {service.iconPlaceholder}
                    </div> 
                    <Card.Title className="text-center h5 fw-bold mb-3">{service.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {service.description}
                    </Card.Text>
                  </div>
                  <div className="text-center mt-4">
                     <Button 
                       as={Link} 
                       to={service.link} 
                       variant="secondary"
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
    </>
  );
};

export default ServicesPage; 