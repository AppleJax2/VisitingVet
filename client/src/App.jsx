import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { checkAuthStatus } from './services/api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProviderProfileEditPage from './pages/ProviderProfileEditPage';
import ProviderProfileViewPage from './pages/ProviderProfileViewPage';
import ProviderSearchPage from './pages/ProviderSearchPage';
import MyPetOwnerAppointmentsPage from './pages/MyPetOwnerAppointmentsPage';
import ProviderAppointmentsPage from './pages/ProviderAppointmentsPage';
import LandingPage from './pages/LandingPage';
import AddPetPage from './pages/AddPetPage';
import MyPetsPage from './pages/MyPetsPage';
import AddReminderPage from './pages/AddReminderPage';
import PetProfilePage from './pages/PetProfilePage';
import ManageRemindersPage from './pages/ManageRemindersPage';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';
import { Spinner, Container } from 'react-bootstrap';

// Import Admin components (assuming paths)
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminUserListPage from './pages/Admin/AdminUserListPage';
import AdminVerificationListPage from './pages/Admin/AdminVerificationListPage';
import AdminLogPage from './pages/Admin/AdminLogPage';
import AdminSettingsPage from './pages/Admin/AdminSettingsPage';
import AdminEditProfilePage from './pages/Admin/AdminEditProfilePage';

// Protected route component with role check
const PrivateRoute = ({ allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const data = await checkAuthStatus();
        if (data && data.success && data.user) {
          setUserRole(data.user.role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    verifyUser();
  }, []);

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!userRole) {
    // Not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Not authorized for this role
    // Redirect to a general dashboard or an unauthorized page
    return <Navigate to="/dashboard" replace />; 
  }

  // Authorized: render the nested routes using Outlet
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Header />
        <div className="main-content flex-grow-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/providers/:id" element={<ProviderProfileViewPage />} />
            <Route path="/search-providers" element={<ProviderSearchPage />} />
            
            {/* Standard Protected Routes - use PrivateRoute with appropriate role checks */}
            <Route element={<PrivateRoute allowedRoles={['PetOwner', 'MVSProvider', 'Clinic', 'Admin']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/provider-profile" element={<ProviderProfileEditPage />} /> 
              <Route path="/my-appointments" element={<MyPetOwnerAppointmentsPage />} />
              <Route path="/provider-appointments" element={<ProviderAppointmentsPage />} />
              <Route path="/add-pet" element={<AddPetPage />} />
              <Route path="/my-pets" element={<MyPetsPage />} />
              <Route path="/add-reminder" element={<AddReminderPage />} />
              <Route path="/pet/:petId" element={<PetProfilePage />} />
              <Route path="/manage-reminders" element={<ManageRemindersPage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUserListPage />} />
                <Route path="edit-profile/:userId" element={<AdminEditProfilePage />} />
                <Route path="verifications" element={<AdminVerificationListPage />} />
                <Route path="logs" element={<AdminLogPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>
            
            {/* Handle 404 - can be replaced with a proper NotFound component */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        {/* Footer is included on all pages except for admin routes */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 