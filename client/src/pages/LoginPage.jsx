import React, { useState, useEffect } from 'react';
import { login, checkAuthStatus } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import theme from '../utils/theme';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await checkAuthStatus();
        if (data && data.success) {
          // User is already logged in, redirect to dashboard
          navigate('/dashboard');
        }
      } catch (err) {
        // Not logged in, stay on login page
        console.log('User not logged in');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true);
    
    try {
      const data = await login({ email, password });
      
      if (data && data.success) {
        // Handle successful login
        console.log('Login successful:', data.user);
        
        // Show a success toast notification
        setToastMessage('Login successful! Redirecting to dashboard...');
        setShowToast(true);
        
        // Navigate after a brief delay to allow the toast to be seen
        setTimeout(() => {
          navigate('/dashboard'); // Redirect to dashboard
        }, 1500);
      } else {
        setError(data?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'An error occurred during login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: 'calc(100vh - 76px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 0',
      backgroundImage: `linear-gradient(rgba(246, 230, 187, 0.7), rgba(246, 230, 187, 0.2))`,
    },
    card: {
      border: 'none',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      overflow: 'hidden',
    },
    cardHeader: {
      background: `linear-gradient(to right, ${theme.colors.primary.main}, ${theme.colors.primary.dark})`,
      color: theme.colors.text.white,
      padding: '20px',
      textAlign: 'center',
    },
    cardBody: {
      padding: '30px',
    },
    button: {
      backgroundColor: theme.colors.secondary.main,
      borderColor: theme.colors.secondary.main,
      padding: '10px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    link: {
      color: theme.colors.primary.main,
      fontWeight: '500',
      transition: 'all 0.3s ease',
    },
    toast: {
      backgroundColor: theme.colors.success,
      color: 'white',
    }
  };

  if (isChecking) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 76px)' }}>
        <Spinner animation="border" role="status" style={{ color: theme.colors.primary.main }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <div style={styles.container}>
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide
          style={styles.toast}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
      
      <Container>
        <Row className="justify-content-md-center">
          <Col md={6} lg={5}>
            <Card className="fade-in" style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 className="m-0 fw-bold">Login</h3>
              </div>
              <Card.Body style={styles.cardBody}>
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      label="Remember me"
                    />
                    <Link to="/forgot-password" style={styles.link}>
                      Forgot Password?
                    </Link>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-100 d-flex justify-content-center align-items-center"
                    style={styles.button}
                    disabled={isLoading}
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
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login
                      </>
                    )}
                  </Button>
                </Form>
                <div className="mt-4 text-center">
                  Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LoginPage; 