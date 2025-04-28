import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner, Tab, Nav } from 'react-bootstrap';
import { Envelope, Lock, PersonFill, TelephoneFill, Building, HospitalFill, PeopleFill, Check2Circle } from 'react-bootstrap-icons';
import theme from '../utils/theme';
import PasswordStrengthMeter from '../components/Shared/PasswordStrengthMeter';
import { validatePasswordStrength } from '../utils/passwordUtils';
import './AuthPages.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phoneNumber: '',
    carrier: '',
    role: 'PetOwner', // Default role
    smsNotificationsEnabled: false,
    emailNotificationsEnabled: true
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Check password strength
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) {
      setError('Please correct the password issues before continuing');
      setIsLoading(false);
      return;
    }

    try {
      // Extract confirmPassword from form data before sending
      const { confirmPassword, ...registerData } = formData;
      
      const data = await register(registerData);
      if (data.success) {
        // Handle successful registration
        console.log('Registration successful:', data.user);
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { 
      key: 'PetOwner', 
      label: 'Pet Owner', 
      description: 'Register as a pet owner looking for veterinary services.',
      icon: <PersonFill className="me-2" />
    },
    { 
      key: 'MVSProvider', 
      label: 'Mobile Vet Provider', 
      description: 'Register as a mobile veterinary service provider.',
      icon: <HospitalFill className="me-2" />
    },
    { 
      key: 'Clinic', 
      label: 'Veterinary Clinic', 
      description: 'Register as a brick-and-mortar veterinary clinic.',
      icon: <Building className="me-2" />
    }
  ];

  return (
    <div className="auth-page register-page">
      <Container fluid>
        <Row className="min-vh-100 auth-container">
          {/* Left Section - Illustration */}
          <Col lg={5} className="auth-image-container d-none d-lg-flex">
            <div className="auth-image-overlay"></div>
            <div className="auth-image-content">
              <div className="auth-logo mb-5">
                <h1 className="display-4">VisitingVet</h1>
                <p className="lead">Quality Veterinary Care At Your Doorstep</p>
              </div>
              <div className="auth-tagline">
                <h2>Join Our Network</h2>
                <p>Create an account to access quality veterinary services or become a provider on our platform.</p>
              </div>
              <div className="auth-features">
                <div className="auth-feature-item">
                  <Check2Circle size={20} />
                  <span>Find verified veterinarians for your pets</span>
                </div>
                <div className="auth-feature-item">
                  <Check2Circle size={20} />
                  <span>Schedule appointments with ease</span>
                </div>
                <div className="auth-feature-item">
                  <Check2Circle size={20} />
                  <span>Receive care right at your doorstep</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Section - Registration Form */}
          <Col lg={7} className="auth-form-container d-flex align-items-center justify-content-center">
            <div className="auth-form-wrapper">
              <div className="auth-form-header text-center mb-4 d-lg-none">
                <h1 className="h2 mb-2">VisitingVet</h1>
                <p>Quality Care, Convenient Service</p>
              </div>
              
              <Card className="auth-card">
                <Card.Body className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <h2 className="h3 mb-2">Create Your Account</h2>
                    <p className="text-muted">Fill in your details to get started</p>
                  </div>

                  {error && (
                    <Alert variant="danger" className="mb-4">
                      {error}
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleSubmit}>
                    {/* Account Type Selector */}
                    <Form.Group className="mb-4">
                      <Form.Label>I am registering as:</Form.Label>
                      <div className="role-options mt-2">
                        {roleOptions.map((role) => (
                          <div 
                            key={role.key}
                            className={`role-option p-3 mb-3 rounded ${formData.role === role.key ? 'selected' : ''}`}
                            style={{
                              border: `1px solid ${formData.role === role.key ? theme.colors.primary.main : '#ced4da'}`,
                              backgroundColor: formData.role === role.key ? `${theme.colors.primary.main}10` : 'transparent',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer'
                            }}
                            onClick={() => setFormData({...formData, role: role.key})}
                          >
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                <div 
                                  className={`rounded-circle d-flex align-items-center justify-content-center ${formData.role === role.key ? 'selected' : ''}`}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    border: `2px solid ${formData.role === role.key ? theme.colors.primary.main : '#ced4da'}`,
                                  }}
                                >
                                  {formData.role === role.key && <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: theme.colors.primary.main }} />}
                                </div>
                              </div>
                              <div>
                                <h6 className="mb-0 d-flex align-items-center">{role.icon} {role.label}</h6>
                                <p className="text-muted small mb-0 mt-1">{role.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        {/* Email Field */}
                        <Form.Group className="mb-4" controlId="formRegisterEmail">
                          <Form.Label>Email address*</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <Envelope />
                            </span>
                            <Form.Control
                              type="email"
                              placeholder="Enter your email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="auth-input"
                            />
                          </div>
                          <Form.Text className="text-muted">
                            We'll never share your email with anyone else.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        {/* Name Field */}
                        <Form.Group className="mb-4" controlId="formRegisterName">
                          <Form.Label>Full Name</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <PersonFill />
                            </span>
                            <Form.Control
                              type="text"
                              placeholder="Enter your name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="auth-input"
                            />
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        {/* Password Field */}
                        <Form.Group className="mb-4" controlId="formRegisterPassword">
                          <Form.Label>Password*</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <Lock />
                            </span>
                            <Form.Control
                              type="password"
                              placeholder="Create password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              minLength={8}
                              className="auth-input"
                            />
                          </div>
                          <PasswordStrengthMeter password={formData.password} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        {/* Confirm Password Field */}
                        <Form.Group className="mb-4" controlId="formRegisterConfirmPassword">
                          <Form.Label>Confirm Password*</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <Lock />
                            </span>
                            <Form.Control
                              type="password"
                              placeholder="Confirm password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              className="auth-input"
                            />
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="auth-divider">
                      <span>Contact Preferences</span>
                    </div>

                    <Row>
                      <Col md={6}>
                        {/* Phone Number Field */}
                        <Form.Group className="mb-4" controlId="formRegisterPhone">
                          <Form.Label>Phone Number</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <TelephoneFill />
                            </span>
                            <Form.Control
                              type="tel"
                              placeholder="(123) 456-7890"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              className="auth-input"
                            />
                          </div>
                          <Form.Text className="text-muted">
                            Required for SMS notifications
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        {/* Mobile Carrier Field */}
                        <Form.Group className="mb-4" controlId="formRegisterCarrier">
                          <Form.Label>Mobile Carrier</Form.Label>
                          <Form.Select
                            name="carrier"
                            value={formData.carrier}
                            onChange={handleChange}
                            disabled={!formData.phoneNumber}
                            className="auth-input"
                          >
                            <option value="">Select your carrier</option>
                            <option value="att">AT&T</option>
                            <option value="tmobile">T-Mobile</option>
                            <option value="verizon">Verizon</option>
                            <option value="sprint">Sprint</option>
                            <option value="boost">Boost Mobile</option>
                            <option value="cricket">Cricket</option>
                            <option value="metro">Metro by T-Mobile</option>
                            <option value="uscellular">US Cellular</option>
                            <option value="virgin">Virgin Mobile</option>
                            <option value="xfinity">Xfinity Mobile</option>
                            <option value="other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col xs={12}>
                        <div className="d-flex flex-wrap gap-4">
                          <Form.Group controlId="formRegisterEmailNotifications">
                            <Form.Check
                              type="checkbox"
                              label="Receive email notifications"
                              name="emailNotificationsEnabled"
                              checked={formData.emailNotificationsEnabled}
                              onChange={handleChange}
                              className="auth-checkbox"
                            />
                          </Form.Group>
                          <Form.Group controlId="formRegisterSmsNotifications">
                            <Form.Check
                              type="checkbox"
                              label="Receive SMS notifications"
                              name="smsNotificationsEnabled"
                              checked={formData.smsNotificationsEnabled}
                              onChange={handleChange}
                              disabled={!formData.phoneNumber || !formData.carrier}
                              className="auth-checkbox"
                            />
                          </Form.Group>
                        </div>
                      </Col>
                    </Row>

                    <div className="mt-4 mb-3">
                      <Form.Check
                        type="checkbox"
                        id="terms"
                        label={
                          <span>
                            I agree to the <a href="/terms" className="auth-link">Terms of Service</a> and <a href="/privacy" className="auth-link">Privacy Policy</a>
                          </span>
                        }
                        required
                        className="auth-checkbox"
                      />
                    </div>

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
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </Form>
                  
                  <div className="auth-alternate mt-4 text-center">
                    <p className="mb-0">
                      Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
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

export default RegisterPage; 