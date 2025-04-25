import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import theme from '../utils/theme';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('PetOwner'); // Default role
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const data = await register({ email, password, role });
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
          <Col md={6} lg={5}>
            <Card className="fade-in" style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 className="m-0 fw-bold">Register</h3>
              </div>
              <Card.Body style={styles.cardBody}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formRegisterEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formRegisterPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formRegisterConfirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formRegisterRole">
                    <Form.Label>Register as:</Form.Label>
                    <Form.Select 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                      style={styles.formSelect}
                    >
                      <option value="PetOwner">Pet Owner</option>
                      <option value="MVSProvider">Mobile Vet Service Provider</option>
                      <option value="Clinic">Veterinary Clinic</option>
                    </Form.Select>
                  </Form.Group>

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