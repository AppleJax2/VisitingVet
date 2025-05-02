import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css'; // Import SCSS instead
// import './styles/main.scss'; // REMOVED
// import './App.css'; // REMOVED

// Assuming CoreUI components are placed in src/layout and src/components/coreui
import DefaultLayout from './layout/DefaultLayout'; 
// import Header from './components/Header'; // Removed Header below
// import Footer from './components/Footer'; // Removed Footer below
import { Spinner, Container } from 'react-bootstrap'; // Keep for PrivateRoute loading

import { checkAuthStatus } from './services/api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import DashboardPage from './pages/DashboardPage'; // General dashboard redirect based on role
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
import ServiceRequestsPage from './pages/ServiceRequestsPage';
import ServiceRequestDetailPage from './pages/ServiceRequestDetailPage';

// Import Admin components
// import AdminLayout from './components/Admin/AdminLayout'; // REMOVED (using DefaultLayout)
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminUserListPage from './pages/Admin/AdminUserListPage';
import AdminVerificationListPage from './pages/Admin/AdminVerificationListPage';
import AdminLogPage from './pages/Admin/AdminLogPage';
import AdminSettingsPage from './pages/Admin/AdminSettingsPage';
import AdminEditProfilePage from './pages/Admin/AdminEditProfilePage';
import AdminResetPasswordPage from './pages/Admin/AdminResetPasswordPage';
import AdminUserDetailPage from './pages/Admin/AdminUserDetailPage';
import AdminMFASetupPage from './pages/Admin/AdminMFASetupPage';
import AdminSessionsPage from './pages/Admin/AdminSessionsPage';
import AdminPermissionsPage from './pages/Admin/AdminPermissionsPage';
import AdminAnalyticsDashboardPage from './pages/Admin/AdminAnalyticsDashboardPage';

// Import specific Dashboard components if needed for routing/layout
import PetOwnerDashboard from './components/Dashboard/PetOwnerDashboard';
import ProviderDashboard from './components/Dashboard/ProviderDashboard';
import ClinicDashboard from './components/Dashboard/ClinicDashboard';

// Import new pages
import AboutUsPage from './pages/AboutUsPage';
import ServicesPage from './pages/ServicesPage';
import UserProfilePage from './pages/UserProfilePage'; // For Pet Owner profile/settings
import MessagesPage from './pages/Dashboard/MessagesPage'; // Import the new page

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext'; // Import SocketProvider

// Import Payment Pages
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage'; // Assume this page exists or will be created
// Import Stripe Connect Return/Refresh Pages
import StripeConnectReturnPage from './pages/StripeConnectReturnPage';
import StripeConnectRefreshPage from './pages/StripeConnectRefreshPage';


// Protected route component remains the same for now, handling role checks within the layout
const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    // Not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Not authorized for this role
    return <Navigate to="/dashboard" replace />; 
  }

  // Authorized: render the nested routes (which will be wrapped by DefaultLayout)
  return <Outlet />;
};

// New component to wrap routes that need the DefaultLayout
const LayoutWrapper = ({ children }) => {
  // Potentially add logic here if layout needs context or specific props
  return <DefaultLayout>{children}</DefaultLayout>;
};


function AppRoutes() {
  const { user, loading } = useAuth(); // Use auth context here

  if (loading) {
    // Keep the top-level loading spinner for initial auth check
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Routes>
      {/* Public Routes (remain outside DefaultLayout) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-account" element={<VerifyAccountPage />} />
      <Route path="/providers/:id" element={<ProviderProfileViewPage />} />
      <Route path="/search-providers" element={<ProviderSearchPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/pay/appointment/:appointmentId" element={<PaymentPage />} /> 
      <Route path="/appointment/:appointmentId/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/stripe/connect/return" element={<StripeConnectReturnPage />} />
      <Route path="/stripe/connect/refresh" element={<StripeConnectRefreshPage />} />
      <Route path="/admin/forgot-password" element={<AdminResetPasswordPage />} />
      <Route path="/admin/reset-password/:resetToken" element={<AdminResetPasswordPage />} />

      {/* Authenticated Routes - Use PrivateRoute for auth check and nest inside DefaultLayout */}
      <Route element={<PrivateRoute allowedRoles={['PetOwner', 'MVSProvider', 'Clinic', 'Admin']} />}>
        {/* Wrap elements needing the layout with LayoutWrapper */}
        <Route path="/dashboard" element={<LayoutWrapper><DashboardPage /></LayoutWrapper>} /> 
        <Route path="/dashboard/messages" element={<LayoutWrapper><MessagesPage /></LayoutWrapper>} />
        <Route path="/dashboard/messages/:conversationId" element={<LayoutWrapper><MessagesPage /></LayoutWrapper>} />
        
        {/* Pet Owner Routes */}
        <Route path="/dashboard/pet-owner" element={<LayoutWrapper><PetOwnerDashboard /></LayoutWrapper>} />
        <Route path="/my-appointments" element={<LayoutWrapper><MyPetOwnerAppointmentsPage /></LayoutWrapper>} />
        <Route path="/my-pets" element={<LayoutWrapper><MyPetsPage /></LayoutWrapper>} />
        <Route path="/add-pet" element={<LayoutWrapper><AddPetPage /></LayoutWrapper>} />
        <Route path="/pet/:petId" element={<LayoutWrapper><PetProfilePage /></LayoutWrapper>} />
        <Route path="/manage-reminders" element={<LayoutWrapper><ManageRemindersPage /></LayoutWrapper>} />
        <Route path="/add-reminder" element={<LayoutWrapper><AddReminderPage /></LayoutWrapper>} />
        <Route path="/profile" element={<LayoutWrapper><UserProfilePage /></LayoutWrapper>} />
        <Route path="/dashboard/pet-owner/service-requests" element={<LayoutWrapper><ServiceRequestsPage /></LayoutWrapper>} />
        <Route path="/dashboard/pet-owner/service-requests/:id" element={<LayoutWrapper><ServiceRequestDetailPage /></LayoutWrapper>} />

        {/* MVS Provider Routes */}
        <Route path="/dashboard/provider" element={<LayoutWrapper><ProviderDashboard /></LayoutWrapper>} />
        <Route path="/provider-appointments" element={<LayoutWrapper><ProviderAppointmentsPage /></LayoutWrapper>} />
        <Route path="/provider-profile" element={<LayoutWrapper><ProviderProfileEditPage /></LayoutWrapper>} /> 
        <Route path="/dashboard/provider/service-requests" element={<LayoutWrapper><ServiceRequestsPage /></LayoutWrapper>} />
        <Route path="/dashboard/provider/service-requests/:id" element={<LayoutWrapper><ServiceRequestDetailPage /></LayoutWrapper>} />

        {/* Clinic Routes */}
        <Route path="/dashboard/clinic" element={<LayoutWrapper><ClinicDashboard /></LayoutWrapper>} />
        <Route path="/dashboard/clinic/service-requests" element={<LayoutWrapper><ServiceRequestsPage /></LayoutWrapper>} />
        <Route path="/dashboard/clinic/service-requests/:id" element={<LayoutWrapper><ServiceRequestDetailPage /></LayoutWrapper>} />
      </Route>

      {/* Admin Protected Routes - Use PrivateRoute for Admin role check */}
      <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
         {/* Wrap the Admin section with the LayoutWrapper */}
         <Route path="/admin" element={<LayoutWrapper />}> 
            {/* Nest Admin pages directly as children, LayoutWrapper renders DefaultLayout */}
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUserListPage />} />
            <Route path="users/:userId" element={<AdminUserDetailPage />} />
            <Route path="edit-profile/:userId" element={<AdminEditProfilePage />} />
            <Route path="verifications" element={<AdminVerificationListPage />} />
            <Route path="logs" element={<AdminLogPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="mfa-setup" element={<AdminMFASetupPage />} />
            <Route path="sessions" element={<AdminSessionsPage />} />
            <Route path="permissions" element={<AdminPermissionsPage />} />
            <Route path="analytics" element={<AdminAnalyticsDashboardPage />} />
            <Route path="service-requests" element={<ServiceRequestsPage />} />
            <Route path="service-requests/:id" element={<ServiceRequestDetailPage />} />
         </Route>
      </Route>
      
      {/* Handle 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


function App() {
  return (
    <AuthProvider>
      <SocketProvider> { /* Wrap Router with SocketProvider */}
        <Router>
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App; 