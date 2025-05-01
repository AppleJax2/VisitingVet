import React, { useState, useEffect } from 'react';
import { register } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner, Tab, Nav, InputGroup, ProgressBar } from 'react-bootstrap';
import { Envelope, Lock, PersonFill, TelephoneFill, Building, HospitalFill, PeopleFill, Check2Circle, EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import theme from '../utils/theme';
import PasswordStrengthMeter from '../components/Shared/PasswordStrengthMeter';
import { validatePasswordStrength } from '../utils/passwordUtils';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if passwords match whenever either password field changes
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setFormErrors({...formErrors, confirmPassword: 'Passwords do not match'});
      } else {
        const { confirmPassword, ...rest } = formErrors;
        setFormErrors(rest);
      }
    }
  }, [formData.password, formData.confirmPassword]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear field-specific error when user makes changes
    if (formErrors[name]) {
      const newErrors = {...formErrors};
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // Password validation
    if (formData.password) {
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = 'Password does not meet requirements';
      }
    }
    
    // Confirm password validation
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Phone validation if provided
    if (formData.phoneNumber) {
      const phoneRegex = /^[\d\s\(\)\-\+]+$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        errors.phoneNumber = 'Please enter a valid phone number';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    // Validate form
    if (!validateForm()) {
      setError('Please correct the highlighted errors before continuing');
      return;
    }
    
    setIsLoading(true);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={7}>
            <Card className="p-4 p-md-5 shadow-sm border-0">
              <Card.Body>
                <div className="text-center mb-4">
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-primary mb-2"
                  >
                    <path d="M14 10h.01M10 14h.01M8.5 8.5h.01M18.5 8.5h.01M18.5 14.5h.01M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0z"/>
                    <path d="M7 15.5c1 1 3.2 2 5.5 2s4-.5 5.5-2"/>
                  </svg>
                  <h4 className="text-primary mb-0">VisitingVet</h4>
                  <h2 className="h3 mt-3 mb-2 fw-bold">Create Your Account</h2>
                  <p className="text-muted">Fill in your details to get started</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit} noValidate>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">I am registering as:</Form.Label>
                    <Row className="g-3 mt-1">
                      {roleOptions.map((role) => (
                        <Col md={4} key={role.key}>
                          <Card 
                            className={`h-100 text-center p-3 role-option ${formData.role === role.key ? 'border-primary bg-primary bg-opacity-10' : 'border'}`}
                            onClick={() => setFormData({...formData, role: role.key})}
                            style={{ cursor: 'pointer' }} 
                            tabIndex={0}
                            onKeyPress={(e) => e.key === 'Enter' && setFormData({...formData, role: role.key})}
                          >
                            <Card.Body className="p-1">
                              <div className="mb-2">{React.cloneElement(role.icon, { size: 24 })}</div>
                              <h6 className="mb-1 fw-semibold small">{role.label}</h6>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Form.Group>

                  <h5 className="mb-3 mt-4 pt-2 border-top">Personal Information</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formRegisterEmail">
                        <Form.Label>Email address<span className="text-danger">*</span></Form.Label>
                        <InputGroup hasValidation>
                          <InputGroup.Text><Envelope /></InputGroup.Text>
                          <Form.Control
                            type="email"
                            placeholder="Enter your email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            isInvalid={!!formErrors.email}
                          />
                          <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formRegisterName">
                        <Form.Label>Full Name</Form.Label>
                        <InputGroup>
                          <InputGroup.Text><PersonFill /></InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Enter your name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formRegisterPassword">
                        <Form.Label>Password<span className="text-danger">*</span></Form.Label>
                        <InputGroup hasValidation>
                          <InputGroup.Text><Lock /></InputGroup.Text>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            placeholder="Create password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            isInvalid={!!formErrors.password}
                          />
                          <Button variant="outline-secondary" onClick={togglePasswordVisibility} style={{borderLeft: 'none'}} aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <EyeSlashFill /> : <EyeFill />}
                          </Button>
                          <Form.Control.Feedback type="invalid">{formErrors.password}</Form.Control.Feedback>
                        </InputGroup>
                        <PasswordStrengthMeter password={formData.password} className="mt-2"/>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formRegisterConfirmPassword">
                        <Form.Label>Confirm Password<span className="text-danger">*</span></Form.Label>
                        <InputGroup hasValidation>
                          <InputGroup.Text><Lock /></InputGroup.Text>
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            isInvalid={!!formErrors.confirmPassword}
                          />
                          <Button variant="outline-secondary" onClick={toggleConfirmPasswordVisibility} style={{borderLeft: 'none'}} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                            {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
                          </Button>
                          <Form.Control.Feedback type="invalid">{formErrors.confirmPassword}</Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4 pt-2 border-top">Contact Preferences</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formRegisterPhone">
                        <Form.Label>Phone Number</Form.Label>
                        <InputGroup hasValidation>
                          <InputGroup.Text><TelephoneFill /></InputGroup.Text>
                          <Form.Control
                            type="tel"
                            placeholder="(123) 456-7890"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            isInvalid={!!formErrors.phoneNumber}
                          />
                          <Form.Control.Feedback type="invalid">{formErrors.phoneNumber}</Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formRegisterCarrier">
                        <Form.Label>Mobile Carrier</Form.Label>
                        <Form.Select
                          name="carrier"
                          value={formData.carrier}
                          onChange={handleChange}
                          disabled={!formData.phoneNumber}
                        >
                          <option value="">Select your carrier...</option>
                          <option value="att">AT&T</option>
                          <option value="tmobile">T-Mobile</option>
                          <option value="verizon">Verizon</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col xs={12}>
                      <Card body className="bg-light border p-3">
                        <p className="mb-2 fw-semibold small text-muted text-uppercase">Notifications</p>
                        <Form.Group controlId="formRegisterEmailNotifications" className="mb-2">
                          <Form.Check
                            type="switch"
                            label="Receive email notifications"
                            name="emailNotificationsEnabled"
                            checked={formData.emailNotificationsEnabled}
                            onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="formRegisterSmsNotifications">
                          <Form.Check
                            type="switch"
                            label="Receive SMS notifications (requires phone & carrier)"
                            name="smsNotificationsEnabled"
                            checked={formData.smsNotificationsEnabled}
                            onChange={handleChange}
                            disabled={!formData.phoneNumber || !formData.carrier}
                          />
                        </Form.Group>
                      </Card>
                    </Col>
                  </Row>

                  <Form.Group className="my-4" controlId="formTerms">
                    <Form.Check
                      type="checkbox"
                      id="terms"
                      label={
                        <span className="small">
                          I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                        </span>
                      }
                      required
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>Creating Account...</>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </Form>
                
                <div className="text-center mt-4">
                  <p className="mb-0 text-muted">
                    Already have an account? <Link to="/login">Sign In</Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default RegisterPage; 