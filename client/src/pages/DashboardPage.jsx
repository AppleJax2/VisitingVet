import React, { useState, useEffect } from 'react';
// Remove checkAuthStatus and logout from direct api import
// import { checkAuthStatus, logout } from '../services/api'; 
import { useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import theme from '../utils/theme';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

// Import new dashboard components
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import PetOwnerDashboard from '../components/Dashboard/PetOwnerDashboard';
import ProviderDashboard from '../components/Dashboard/ProviderDashboard';
import ClinicDashboard from '../components/Dashboard/ClinicDashboard';

function DashboardPage() {
  // Use user and loading state from context
  const { user, loading: authLoading, logout: contextLogout } = useAuth(); 
  const navigate = useNavigate();
  const [error, setError] = useState(''); // Keep local error state if needed

  // Redirect to login if auth check fails (context handles this)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    try {
      await contextLogout(); // Use logout from context
      // Navigation is usually handled inside contextLogout or by useEffect above
    } catch (err) {
      // Context logout should handle errors, but log just in case
      console.error('Logout failed via context:', err);
      setError('Logout failed. Please try again.');
    }
  };

  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user) return null; // Return null if no user yet

    // Check if user.role is an object (populated from backend) or just a string
    const roleName = user.role?.name || user.role; 

    let DashboardComponent;
    switch (roleName) {
      case 'PetOwner':
        DashboardComponent = PetOwnerDashboard;
        break;
      case 'MVSProvider':
        DashboardComponent = ProviderDashboard;
        break;
      case 'Clinic':
        DashboardComponent = ClinicDashboard;
        break;
      case 'Admin':
        // Redirect Admin to their specific layout/dashboard
        navigate('/admin');
        return null;
      default:
        console.error('Unknown user role:', roleName);
        setError(`Unknown user role: "${roleName}". Please contact support.`);
        return <Alert variant="danger">Unknown user role encountered.</Alert>;
    }

    // Pass user and logout function down
    return <DashboardComponent user={user} />; 
  };

  if (authLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {error && <Alert variant="danger" className="m-3">{error}</Alert>}
      {renderDashboard()}
    </DashboardLayout>
  );
}

export default DashboardPage; 