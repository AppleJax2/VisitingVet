import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { Lock } from 'react-bootstrap-icons';
// import './AuthPages.css';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await resetPassword(token, { password });
      if (response.success) {
        setMessage('Your password has been reset successfully.');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="auth-card shadow-lg">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  {/* Optional: Add Logo Here */}
                  <h2 className="h3 mb-2">Create New Password</h2>
                  <p className="text-muted">Enter your new password below.</p>
                </div>

                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit} className="auth-form">
                  <Form.Group className="mb-3" controlId="formNewPassword">
                    <Form.Label>New Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Lock />
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        minLength="8"
                      />
                    </div>
                    <Form.Text className="text-muted">
                      Password must be at least 8 characters long.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formConfirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Lock />
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        minLength="8"
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
                        Resetting...
                      </>
                    ) : 'Reset Password'}
                  </Button>
                </Form>
                
                <div className="text-center mt-4">
                  <Link to="/login" className="auth-link">
                    Back to Login
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ResetPasswordPage; 