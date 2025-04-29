import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Form, 
  Button, 
  Container, 
  Row, 
  Col, 
  Card, 
  Alert, 
  Spinner, 
  Toast, 
  ToastContainer,
  Modal,
  FormControl,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { 
  Envelope, 
  Lock, 
  BoxArrowInRight, 
  Check2Circle, 
  ShieldCheck, 
  Calendar,
  GeoAlt,
  ShieldLock,
  EyeFill,
  EyeSlashFill
} from 'react-bootstrap-icons';
import './AuthPages.css';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: authLoading, mfaRequired, handleMfaVerification } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const emailInputRef = useRef(null);
  
  // MFA verification states
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [verifyingMfa, setVerifyingMfa] = useState(false);
  const [userId, setUserId] = useState(null);

  // Check for session expired query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('session_expired') === 'true') {
      setError('Your session has expired. Please sign in again.');
    }
  }, [location.search]);

  useEffect(() => {
    if (!authLoading && user) {
      // Check if we should redirect to a specific page after login
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        navigate('/dashboard');
      }
    }

    // Set focus to email input on load
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [user, authLoading, navigate]);

  // Show MFA modal when MFA is required
  useEffect(() => {
    if (mfaRequired) {
      setShowMfaModal(true);
    }
  }, [mfaRequired]);

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Validate email format
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await login({ email, password, rememberMe });
      
      if (response.mfaRequired) {
        // Store userId for MFA verification
        setUserId(response.userId);
        // MFA modal will be shown by the useEffect hook
      } else if (response && response.success) {
        console.log('Login successful via context:', response.user);
        setToastMessage('Login successful! Redirecting to dashboard...');
        setShowToast(true);
      } else {
        setError(response?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'An error occurred during login. Please try again.'
      );
      setShowToast(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setMfaError('');
    setVerifyingMfa(true);

    try {
      const response = await handleMfaVerification(userId, mfaToken);
      
      if (response && response.success) {
        setShowMfaModal(false);
        setToastMessage('Login successful! Redirecting to dashboard...');
        setShowToast(true);
      } else {
        setMfaError(response?.message || 'MFA verification failed.');
      }
    } catch (err) {
      console.error('MFA verification error:', err);
      setMfaError(
        err.response?.data?.message || 
        err.message || 
        'An error occurred during MFA verification. Please try again.'
      );
    } finally {
      setVerifyingMfa(false);
    }
  };

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 76px)' }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="auth-page">
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
      
      {/* MFA Verification Modal */}
      <Modal 
        show={showMfaModal} 
        onHide={() => setShowMfaModal(false)}
        backdrop="static"
        keyboard={false}
        centered
        className="auth-modal"
      >
        <Modal.Header>
          <Modal.Title>
            <ShieldLock className="me-2" />
            Two-Factor Authentication
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please enter the verification code from your authentication app.</p>
          
          {mfaError && (
            <Alert variant="danger" className="mb-3">
              {mfaError}
            </Alert>
          )}
          
          <Form onSubmit={handleMfaSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Authentication Code</Form.Label>
              <FormControl
                type="text"
                placeholder="Enter 6-digit code"
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value.trim())}
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
                autoFocus
                required
                disabled={verifyingMfa}
                className="auth-input"
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit"
                disabled={verifyingMfa || !mfaToken || mfaToken.length < 6}
                className="auth-button"
              >
                {verifyingMfa ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={10} xl={9}>
            <Card className="auth-card overflow-hidden">
              <Row className="g-0">
                <Col lg={5} className="auth-sidebar d-none d-lg-flex">
                  <div className="auth-sidebar-content">
                    <div className="auth-logo">
                      <svg 
                        width="28" 
                        height="28" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M14 10h.01M10 14h.01M8.5 8.5h.01M18.5 8.5h.01M18.5 14.5h.01M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0z"/>
                        <path d="M7 15.5c1 1 3.2 2 5.5 2s4-.5 5.5-2"/>
                      </svg>
                      <h4>VisitingVet</h4>
                    </div>
                    
                    <h2>Welcome Back!</h2>
                    <p>Log in to access your account and manage your veterinary services.</p>
                    
                    <ul className="auth-features">
                      <li>
                        <ShieldCheck />
                        Connect with verified veterinary professionals
                      </li>
                      <li>
                        <Calendar />
                        Manage appointments effortlessly
                      </li>
                      <li>
                        <GeoAlt />
                        Get care delivered right to your doorstep
                      </li>
                    </ul>
                  </div>
                </Col>
                
                <Col lg={7}>
                  <div className="auth-content">
                    <div className="d-flex justify-content-center mb-4 d-lg-none">
                      <div className="auth-logo auth-logo-mobile">
                        <svg 
                          width="28" 
                          height="28" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#577E46" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M14 10h.01M10 14h.01M8.5 8.5h.01M18.5 8.5h.01M18.5 14.5h.01M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0z"/>
                          <path d="M7 15.5c1 1 3.2 2 5.5 2s4-.5 5.5-2"/>
                        </svg>
                        <h4 style={{ color: '#577E46' }}>VisitingVet</h4>
                      </div>
                    </div>
                    
                    <h2>Sign In</h2>
                    <p>Enter your credentials to access your account</p>
                    
                    {error && (
                      <div className="auth-error">
                        {error}
                      </div>
                    )}
                    
                    <Form onSubmit={handleSubmit} className="auth-form">
                      <Form.Group className="mb-4" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <InputGroup hasValidation>
                          <InputGroup.Text>
                            <Envelope />
                          </InputGroup.Text>
                          <Form.Control
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                            disabled={isSubmitting}
                            isInvalid={!!emailError}
                            ref={emailInputRef}
                            className="auth-input"
                          />
                          <Form.Control.Feedback type="invalid">
                            {emailError}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-4" controlId="formBasicPassword">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Form.Label className="mb-0">Password</Form.Label>
                          <Link to="/forgot-password" className="forgot-password">
                            Forgot Password?
                          </Link>
                        </div>
                        <InputGroup>
                          <InputGroup.Text>
                            <Lock />
                          </InputGroup.Text>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="auth-input"
                          />
                          <Button 
                            variant="outline-secondary" 
                            onClick={togglePasswordVisibility}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="password-toggle"
                          >
                            {showPassword ? <EyeSlashFill /> : <EyeFill />}
                          </Button>
                        </InputGroup>
                      </Form.Group>
                      
                      <Form.Group className="mb-4" controlId="formBasicCheckbox">
                        <Form.Check
                          type="checkbox"
                          label="Remember me"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          disabled={isSubmitting}
                          className="auth-checkbox"
                        />
                      </Form.Group>
                      
                      <div className="login-button-container mb-3">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={isSubmitting}
                          className="btn-primary w-100 auth-button"
                        >
                          {isSubmitting ? (
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
                            "Sign In"
                          )}
                        </Button>
                      </div>
                      
                      <div className="auth-footer">
                        Don't have an account? <Link to="/register">Create Account</Link>
                      </div>
                    </Form>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Additional styling for improvements */}
      <style jsx>{`
        .auth-sidebar-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .auth-logo-mobile {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .login-button-container {
          margin-top: 1.5rem;
        }
        
        .password-toggle {
          border-left: none;
        }
        
        .password-toggle:focus, 
        .password-toggle:active {
          box-shadow: none;
        }
        
        .auth-input {
          height: calc(2.5rem + 2px);
        }
        
        .auth-checkbox .form-check-label {
          display: flex;
          align-items: center;
        }
        
        /* Extra small screen improvements */
        @media (max-width: 576px) {
          .auth-content {
            padding: 1.5rem;
          }
          
          .auth-card {
            margin: 0 0.5rem;
            border-radius: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default LoginPage; 