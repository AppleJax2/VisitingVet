import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css'; // Import SCSS instead
import './styles/main.scss'; // Import custom SCSS
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
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';
import { Spinner, Container } from 'react-bootstrap';

// Import Admin components
import AdminLayout from './components/Admin/AdminLayout';
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

// Protected route component with role check using context
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

  // Authorized: render the nested routes
  return <Outlet />;
};

function AppRoutes() {
  const { user, loading } = useAuth(); // Use auth context here

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Header />
      <div className="main-content flex-grow-1">
        <Routes>
          {/* Public Routes */}
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
          
          {/* Payment Routes - Public access needed for Stripe redirect */}
          <Route path="/pay/appointment/:appointmentId" element={<PaymentPage />} /> 
          <Route path="/appointment/:appointmentId/payment-success" element={<PaymentSuccessPage />} />
          {/* Stripe Connect Return URLs - Should be accessible without strict login state sometimes */}
          <Route path="/stripe/connect/return" element={<StripeConnectReturnPage />} />
          <Route path="/stripe/connect/refresh" element={<StripeConnectRefreshPage />} />

          {/* Admin specific password reset routes */}
          <Route path="/admin/forgot-password" element={<AdminResetPasswordPage />} />
          <Route path="/admin/reset-password/:resetToken" element={<AdminResetPasswordPage />} />

          {/* Logged-in User Routes (Dashboard is role-specific) */}
          <Route element={<PrivateRoute allowedRoles={['PetOwner', 'MVSProvider', 'Clinic', 'Admin']} />}>
            <Route path="/dashboard" element={<DashboardPage />} /> 
            <Route path="/dashboard/messages" element={<MessagesPage />} />
            <Route path="/dashboard/messages/:conversationId" element={<MessagesPage />} />
            
            {/* Pet Owner Routes */}
            <Route path="/dashboard/pet-owner" element={<PetOwnerDashboard />} />
            <Route path="/my-appointments" element={<MyPetOwnerAppointmentsPage />} />
            <Route path="/my-pets" element={<MyPetsPage />} />
            <Route path="/add-pet" element={<AddPetPage />} />
            <Route path="/pet/:petId" element={<PetProfilePage />} />
            <Route path="/manage-reminders" element={<ManageRemindersPage />} />
            <Route path="/add-reminder" element={<AddReminderPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/dashboard/pet-owner/service-requests" element={<ServiceRequestsPage />} />
            <Route path="/dashboard/pet-owner/service-requests/:id" element={<ServiceRequestDetailPage />} />

            {/* MVS Provider Routes */}
            <Route path="/dashboard/provider" element={<ProviderDashboard />} />
            <Route path="/provider-appointments" element={<ProviderAppointmentsPage />} />
            <Route path="/provider-profile" element={<ProviderProfileEditPage />} /> 
            {/* <Route path="/provider-clients" element={<ProviderClientsPage />} /> Add this page if needed */}
            {/* <Route path="/provider-settings" element={<ProviderSettingsPage />} /> Add this page if needed */}
            <Route path="/dashboard/provider/service-requests" element={<ServiceRequestsPage />} />
            <Route path="/dashboard/provider/service-requests/:id" element={<ServiceRequestDetailPage />} />

            {/* Clinic Routes */}
            <Route path="/dashboard/clinic" element={<ClinicDashboard />} />
            {/* <Route path="/clinic-appointments" element={<ClinicAppointmentsPage />} /> Add this page */}
            {/* <Route path="/clinic-staff" element={<ClinicStaffPage />} /> Add this page */}
            {/* <Route path="/clinic-profile" element={<ClinicProfilePage />} /> Add this page */}
            {/* <Route path="/clinic-settings" element={<ClinicSettingsPage />} /> Add this page */}
            <Route path="/dashboard/clinic/service-requests" element={<ServiceRequestsPage />} />
            <Route path="/dashboard/clinic/service-requests/:id" element={<ServiceRequestDetailPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
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
      </div>
      {/* Footer - conditional rendering based on route might be needed */}
      <Footer /> 
    </div>
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