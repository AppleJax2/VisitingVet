import React from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { CilCompass, CilShieldAlt, CilThumbUp } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const AboutUsPage = () => {
  return (
    <>
      <div className="bg-light text-dark py-5 mb-5 text-center position-relative overflow-hidden" role="banner" aria-labelledby="page-title">
        <Container>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="display-4 fw-bold text-primary" id="page-title">About VisitingVet</h1>
            <hr className="w-25 mx-auto border-primary border-2 opacity-100 my-4" aria-hidden="true" />
            <motion.p
              className="lead text-muted subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Connecting pets and vets, wherever you are.
            </motion.p>
          </motion.div>
        </Container>
      </div>

      <Container>
        <section className="py-5" aria-labelledby="mission-title">
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, staggerChildren: 0.2 }}
                viewport={{ once: true }}
              >
                <motion.h2
                  className="text-primary mb-3"
                  id="mission-title"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  Our Mission
                </motion.h2>
                <blockquote className="blockquote border-start border-4 border-primary ps-3 py-2 my-4 fst-italic fw-medium">
                  Every animal deserves quality care in the comfort of their own environment.
                </blockquote>

                <motion.p
                  className="text-muted mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
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
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Image
                  src="/assets/images/landing-page/about-mission.jpg"
                  alt="Veterinarian caring for a dog at home"
                  fluid
                  rounded
                  className="shadow-sm border"
                />
              </motion.div>
            </Col>
          </Row>
        </section>

        <section className="py-5" aria-labelledby="values-title">
          <h2 className="text-primary fw-bold mb-5 text-center" id="values-title">Our Values</h2>
          <Row>
            <Col md={4} className="mb-4">
              <motion.div
                whileHover={{ y: -8, scale: 1.03 }}
                className="h-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card
                  className="text-center h-100 shadow border-0 rounded-3"
                  style={{ backgroundColor: 'var(--cui-primary-ghost)' }}
                >
                  <Card.Body className="d-flex flex-column align-items-center">
                    <motion.div
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ width: '60px', height: '60px' }}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                      aria-hidden="true"
                    >
                      <CIcon icon={CilCompass} size="xl" />
                    </motion.div>
                    <Card.Title className="h5 mb-2">Compassion</Card.Title>
                    <Card.Text className="text-muted small">
                      We prioritize the well-being and comfort of every animal we serve.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            <Col md={4} className="mb-4">
              <motion.div
                whileHover={{ y: -8, scale: 1.03 }}
                className="h-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className="text-center h-100 shadow border-0 rounded-3"
                  style={{ backgroundColor: 'var(--cui-primary-ghost)' }}
                >
                  <Card.Body className="d-flex flex-column align-items-center">
                    <motion.div
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ width: '60px', height: '60px' }}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                      aria-hidden="true"
                    >
                      <CIcon icon={CilThumbUp} size="xl" />
                    </motion.div>
                    <Card.Title className="h5 mb-2">Convenience</Card.Title>
                    <Card.Text className="text-muted small">
                      Bringing expert veterinary care directly to your doorstep, saving you time and stress.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            <Col md={4} className="mb-4">
              <motion.div
                whileHover={{ y: -8, scale: 1.03 }}
                className="h-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card
                  className="text-center h-100 shadow border-0 rounded-3"
                  style={{ backgroundColor: 'var(--cui-primary-ghost)' }}
                >
                  <Card.Body className="d-flex flex-column align-items-center">
                    <motion.div
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ width: '60px', height: '60px' }}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                      aria-hidden="true"
                    >
                      <CIcon icon={CilShieldAlt} size="xl" />
                    </motion.div>
                    <Card.Title className="h5 mb-2">Trust</Card.Title>
                    <Card.Text className="text-muted small">
                      Connecting you with verified, experienced, and compassionate veterinary professionals.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </section>

        <section className="py-5 bg-light rounded-3 mb-5" aria-labelledby="team-title">
          <Container>
            <h2 className="text-primary fw-bold mb-5 text-center" id="team-title">Meet the (Placeholder) Team</h2>
            <Row className="justify-content-center">
              <Col md={4} lg={3} className="mb-4 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Image src="https://via.placeholder.com/150/CCCCCC/808080?text=Team+Member" roundedCircle className="mb-3 shadow-sm" width={150} height={150} />
                  <h5 className="mb-1">Dr. Jane Doe</h5>
                  <p className="text-muted small">Founder & Lead Veterinarian</p>
                </motion.div>
              </Col>
              <Col md={4} lg={3} className="mb-4 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <Image src="https://via.placeholder.com/150/CCCCCC/808080?text=Team+Member" roundedCircle className="mb-3 shadow-sm" width={150} height={150} />
                  <h5 className="mb-1">John Smith</h5>
                  <p className="text-muted small">Operations Lead</p>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>
      </Container>
    </>
  );
};

export default AboutUsPage; 