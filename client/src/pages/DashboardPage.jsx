import React, { useState, useEffect } from 'react';
import { checkAuthStatus, logout } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Alert, Card } from 'react-bootstrap';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await checkAuthStatus();
        if (data && data.success) {
          setUser(data.user);
        } else {
          // Not authenticated or error
          navigate('/login');
        }
      } catch (err) {
        setError('Session check failed. Please login again.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/login');
    } catch (err) {
      setError('Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {user && (
        <Card>
          <Card.Body>
            <Card.Title>Welcome, {user.email}!</Card.Title>
            <Card.Text>
              Your role is: {user.role}
              {/* Placeholder for role-specific dashboard content */}
              <br />
              This is a basic dashboard. More features will be added based on your role.
            </Card.Text>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default DashboardPage; 