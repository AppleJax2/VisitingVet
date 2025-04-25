import React, { useState } from 'react';
import { login } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import theme from '../utils/theme';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const data = await login({ email, password });
      if (data.success) {
        // Handle successful login (e.g., update auth state, redirect)
        console.log('Login successful:', data.user);
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
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
  };

  return (
    <div style={styles.container}>
      <Container>
        <Row className="justify-content-md-center">
          <Col md={6} lg={5}>
            <Card className="fade-in" style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 className="m-0 fw-bold">Login</h3>
              </div>
              <Card.Body style={styles.cardBody}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button 
                    type="submit" 
                    className="w-100"
                    style={styles.button}
                  >
                    Login
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