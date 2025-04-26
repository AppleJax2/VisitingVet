import React, { useState, useEffect } from 'react';
import { checkAuthStatus, logout } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import theme from '../utils/theme';

// Import new dashboard components
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import PetOwnerDashboard from '../components/Dashboard/PetOwnerDashboard';
import ProviderDashboard from '../components/Dashboard/ProviderDashboard';
import ClinicDashboard from '../components/Dashboard/ClinicDashboard';

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
      // Try to call the API to logout
      await logout();
    } catch (err) {
      console.error('Logout failed on server side, continuing with client-side logout:', err);
    } finally {
      // Always clear the user state and redirect regardless of API success/failure
      setUser(null);
      
      // Clear any stored tokens or session information
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      
      // Navigate to login page
      navigate('/login');
    }
  };

  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user) return null;

    switch(user.role) {
      case 'PetOwner':
        return <PetOwnerDashboard user={user} />;
      case 'MVSProvider':
        return <ProviderDashboard user={user} />;
      case 'Clinic':
        return <ClinicDashboard user={user} />;
      default:
        return (
          <Container className="py-5 text-center">
            <Alert variant="warning">
              Unknown user role: {user.role}. Please contact support.
            </Alert>
          </Container>
        );
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" style={{color: theme.colors.primary.main}}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {user && (
        <DashboardLayout user={user} onLogout={handleLogout}>
          {renderDashboard()}
        </DashboardLayout>
      )}
    </>
  );
}

export default DashboardPage; 