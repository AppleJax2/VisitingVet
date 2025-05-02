import React, { useState } from 'react';
import { requestPasswordReset } from '../services/api';
import { Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { Envelope } from 'react-bootstrap-icons';
// import './AuthPages.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await requestPasswordReset({ email });
      if (response.success) {
        setMessage('If an account with that email exists, a password reset link has been sent.');
      } else {
        setError(response.message || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 py-5">
      <Row className="justify-content-center w-100">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                 {/* Optional: Add Logo Here */}
                <h2 className="h3 mb-2">Reset Password</h2>
                <p className="text-muted">Enter your email address to receive a password reset link.</p>
              </div>

              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="formResetEmail">
                  <Form.Label>Email address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Envelope />
                    </span>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary w-100"
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </Button>
              </Form>
              
              <div className="text-center mt-4">
                <Link to="/login">
                  Back to Login
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPasswordPage; 