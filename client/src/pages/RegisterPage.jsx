import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import theme from '../utils/theme';

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Extract confirmPassword from form data before sending
      const { confirmPassword, ...registerData } = formData;
      
      const data = await register(registerData);
      if (data.success) {
        // Handle successful registration (e.g., update auth state, redirect)
        console.log('Registration successful:', data.user);
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration.');
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
    formSelect: {
      borderColor: '#ced4da',
      '&:focus': {
        borderColor: theme.colors.primary.main,
        boxShadow: `0 0 0 0.25rem rgba(87, 126, 70, 0.25)`,
      },
    },
    roleOption: {
      display: 'flex',
      margin: '10px 0',
      borderRadius: theme.borderRadius.md,
      border: `1px solid #ced4da`,
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    },
    roleOptionSelected: {
      borderColor: theme.colors.primary.main,
      boxShadow: `0 0 0 1px ${theme.colors.primary.main}`,
    }
  };

  return (
    <div style={styles.container}>
      <Container>
        <Row className="justify-content-md-center">
          <Col md={8} lg={6}>
            <Card className="fade-in" style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 className="m-0 fw-bold">Register</h3>
              </div>
              <Card.Body style={styles.cardBody}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formRegisterEmail">
                        <Form.Label>Email address*</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formRegisterName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formRegisterPassword">
                        <Form.Label>Password*</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formRegisterConfirmPassword">
                        <Form.Label>Confirm Password*</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm Password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="formRegisterRole">
                    <Form.Label>Register as:*</Form.Label>
                    <Form.Select 
                      name="role"
                      value={formData.role} 
                      onChange={handleChange}
                      style={styles.formSelect}
                      required
                    >
                      <option value="PetOwner">Pet Owner</option>
                      <option value="MVSProvider">Mobile Vet Service Provider</option>
                      <option value="Clinic">Veterinary Clinic</option>
                    </Form.Select>
                  </Form.Group>

                  <h5 className="mt-4 mb-3">Notification Preferences</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formRegisterPhone">
                        <Form.Label>Phone Number (for SMS)</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="(123) 456-7890"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                        />
                        <Form.Text className="text-muted">
                          Required for SMS notifications
                        </Form.Text>
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
                        <Form.Text className="text-muted">
                          Required for SMS notifications
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col>
                      <Form.Group controlId="formRegisterEmailNotifications">
                        <Form.Check
                          type="checkbox"
                          label="Receive email notifications"
                          name="emailNotificationsEnabled"
                          checked={formData.emailNotificationsEnabled}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId="formRegisterSmsNotifications">
                        <Form.Check
                          type="checkbox"
                          label="Receive SMS notifications"
                          name="smsNotificationsEnabled"
                          checked={formData.smsNotificationsEnabled}
                          onChange={handleChange}
                          disabled={!formData.phoneNumber || !formData.carrier}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button 
                    type="submit" 
                    className="w-100 mt-2"
                    style={styles.button}
                  >
                    Register
                  </Button>
                </Form>
                <div className="mt-4 text-center">
                  Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
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