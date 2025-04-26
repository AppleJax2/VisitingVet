import React, { useState, useEffect } from 'react';
import { login, checkAuthStatus } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { Envelope, Lock, BoxArrowInRight, Check2Circle } from 'react-bootstrap-icons';
import theme from '../utils/theme';
import './AuthPages.css'; // We'll create this CSS file for login and register pages

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

  if (isChecking) {
    return (
      <div className="auth-loading-container">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="auth-page login-page">
      {/* Toast notification for success messages */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide
          bg="success"
          text="white"
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
      
      {/* Main content */}
      <Container fluid>
        <Row className="min-vh-100 auth-container">
          {/* Left Section - Illustration */}
          <Col lg={6} className="auth-image-container d-none d-lg-flex">
            <div className="auth-image-overlay"></div>
            <div className="auth-image-content">
              <div className="auth-logo mb-5">
                <h1 className="display-4">VisitingVet</h1>
                <p className="lead">Quality Veterinary Care At Your Doorstep</p>
              </div>
              <div className="auth-tagline">
                <h2>Welcome Back!</h2>
                <p>Log in to access your account and manage your veterinary services.</p>
              </div>
              <div className="auth-features">
                <div className="auth-feature-item">
                  <Check2Circle size={20} />
                  <span>Connect with verified veterinary professionals</span>
                </div>
                <div className="auth-feature-item">
                  <Check2Circle size={20} />
                  <span>Manage appointments effortlessly</span>
                </div>
                <div className="auth-feature-item">
                  <Check2Circle size={20} />
                  <span>Get care delivered right to your doorstep</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Section - Login Form */}
          <Col lg={6} className="auth-form-container d-flex align-items-center justify-content-center">
            <div className="auth-form-wrapper">
              <div className="auth-form-header text-center mb-4 d-lg-none">
                <h1 className="h2 mb-2">VisitingVet</h1>
                <p>Quality Care, Convenient Service</p>
              </div>
              
              <Card className="auth-card">
                <Card.Body className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <h2 className="h3 mb-3">Sign In</h2>
                    <p className="text-muted">Enter your credentials to access your account</p>
                  </div>

                  {error && (
                    <Alert variant="danger" className="mb-4">
                      {error}
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4" controlId="formBasicEmail">
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
                          className="auth-input"
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formBasicPassword">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <Form.Label className="mb-0">Password</Form.Label>
                        <Link to="/forgot-password" className="auth-link small">
                          Forgot Password?
                        </Link>
                      </div>
                      <div className="input-group">
                        <span className="input-group-text">
                          <Lock />
                        </span>
                        <Form.Control
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="auth-input"
                        />
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-4" controlId="formBasicCheckbox">
                      <Form.Check
                        type="checkbox"
                        label="Remember me"
                        className="auth-checkbox"
                      />
                    </Form.Group>
                    
                    <Button 
                      type="submit" 
                      className="auth-button w-100"
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
                          Signing in...
                        </>
                      ) : (
                        <>
                          <BoxArrowInRight className="me-2" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </Form>
                  
                  <div className="auth-alternate mt-4 text-center">
                    <p className="mb-0">
                      Don't have an account? <Link to="/register" className="auth-link">Create Account</Link>
                    </p>
                  </div>
                </Card.Body>
              </Card>
              
              <div className="auth-footer text-center mt-4">
                <p className="small text-muted mb-0">
                  &copy; {new Date().getFullYear()} VisitingVet. All rights reserved.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LoginPage; 