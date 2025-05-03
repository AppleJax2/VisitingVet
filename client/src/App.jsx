import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css'; // Import SCSS instead
// import './styles/main.scss'; // REMOVED
// import './App.css'; // REMOVED

// Assuming CoreUI components are placed in src/layout and src/components/coreui
import DefaultLayout from './layout/DefaultLayout'; 
// import Header from './components/Header'; // Removed Header below
// import Footer from './components/Footer'; // Removed Footer below
import { Spinner, Container, Button, Alert } from 'react-bootstrap'; // Keep for PrivateRoute loading

// Removed direct import of checkAuthStatus as we use it via context now
// import { checkAuthStatus } from './services/api';

// Use regular import for LandingPage to ensure it loads immediately
import LandingPage from './pages/LandingPage';

// Lazily load other pages to optimize performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyAccountPage = lazy(() => import('./pages/VerifyAccountPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage')); // General dashboard redirect based on role
const ProviderProfileEditPage = lazy(() => import('./pages/ProviderProfileEditPage'));
const ProviderProfileViewPage = lazy(() => import('./pages/ProviderProfileViewPage'));
const ProviderSearchPage = lazy(() => import('./pages/ProviderSearchPage'));
const MyPetOwnerAppointmentsPage = lazy(() => import('./pages/MyPetOwnerAppointmentsPage'));
const ProviderAppointmentsPage = lazy(() => import('./pages/ProviderAppointmentsPage'));
const AddPetPage = lazy(() => import('./pages/AddPetPage'));
const MyPetsPage = lazy(() => import('./pages/MyPetsPage'));
const AddReminderPage = lazy(() => import('./pages/AddReminderPage'));
const PetProfilePage = lazy(() => import('./pages/PetProfilePage'));
const ManageRemindersPage = lazy(() => import('./pages/ManageRemindersPage'));
const ServiceRequestsPage = lazy(() => import('./pages/ServiceRequestsPage'));
const ServiceRequestDetailPage = lazy(() => import('./pages/ServiceRequestDetailPage'));

// Import Admin components
const AdminDashboardPage = lazy(() => import('./pages/Admin/AdminDashboardPage'));
const AdminUserListPage = lazy(() => import('./pages/Admin/AdminUserListPage'));
const AdminVerificationListPage = lazy(() => import('./pages/Admin/AdminVerificationListPage'));
const AdminLogPage = lazy(() => import('./pages/Admin/AdminLogPage'));
const AdminSettingsPage = lazy(() => import('./pages/Admin/AdminSettingsPage'));
const AdminEditProfilePage = lazy(() => import('./pages/Admin/AdminEditProfilePage'));
const AdminResetPasswordPage = lazy(() => import('./pages/Admin/AdminResetPasswordPage'));
const AdminUserDetailPage = lazy(() => import('./pages/Admin/AdminUserDetailPage'));
const AdminMFASetupPage = lazy(() => import('./pages/Admin/AdminMFASetupPage'));
const AdminSessionsPage = lazy(() => import('./pages/Admin/AdminSessionsPage'));
const AdminPermissionsPage = lazy(() => import('./pages/Admin/AdminPermissionsPage'));
const AdminAnalyticsDashboardPage = lazy(() => import('./pages/Admin/AdminAnalyticsDashboardPage'));

// Import specific Dashboard components if needed for routing/layout
const PetOwnerDashboard = lazy(() => import('./components/Dashboard/PetOwnerDashboard'));
const ProviderDashboard = lazy(() => import('./components/Dashboard/ProviderDashboard'));
const ClinicDashboard = lazy(() => import('./components/Dashboard/ClinicDashboard'));

// Import new pages
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage')); // For Pet Owner profile/settings
const MessagesPage = lazy(() => import('./pages/Dashboard/MessagesPage')); // Import the new page

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext'; // Import SocketProvider

// Import Payment Pages
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage')); // Assume this page exists or will be created
// Import Stripe Connect Return/Refresh Pages
const StripeConnectReturnPage = lazy(() => import('./pages/StripeConnectReturnPage'));
const StripeConnectRefreshPage = lazy(() => import('./pages/StripeConnectRefreshPage'));

// Fallback loading component for lazy-loaded routes
const PageLoading = () => (
  <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </Container>
);

// Emergency fallback component when a route fails to load
const ErrorBoundaryFallback = ({ message, onRetry }) => (
  <Container className="text-center mt-5">
    <Alert variant="danger">
      <Alert.Heading>Something went wrong</Alert.Heading>
      <p>{message || "We're sorry, but we couldn't load this page."}</p>
    </Alert>
    <Button onClick={onRetry || (() => window.location.reload())} variant="primary">
      Try Again
    </Button>
  </Container>
);

// Protected route component remains the same for now, handling role checks within the layout
const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading, authError } = useAuth();

  if (loading) {
    return <PageLoading />;
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
  // LayoutWrapper now needs to render an <Outlet /> to display nested routes
  return (
    <DefaultLayout>
      {children || <Outlet />} {/* Render children if passed, otherwise Outlet */}
    </DefaultLayout>
  );
};

function AppRoutes() {
  const { user, loading, authError } = useAuth(); // Use auth context here
  const [routeError, setRouteError] = useState(null);

  if (loading) {
    // Keep the top-level loading spinner for initial auth check
    return <PageLoading />;
  }

  // If there's a route error, show the fallback
  if (routeError) {
    return <ErrorBoundaryFallback message={routeError} onRetry={() => setRouteError(null)} />;
  }

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Home route with directly imported LandingPage for immediate loading */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Public Routes (remain outside DefaultLayout) - these are lazy-loaded */}
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
           {/* The parent /admin route uses LayoutWrapper */}
           <Route path="/admin" element={<LayoutWrapper />}> 
              {/* Nested Admin pages render inside LayoutWrapper's Outlet */}
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
    </Suspense>
  );
}


function App() {
  // Handle potential errors at the top level
  const [appError, setAppError] = useState(null);

  useEffect(() => {
    // Global error handler for unhandled exceptions
    const errorHandler = (error) => {
      console.error('Unhandled error in React:', error);
      setAppError('An unexpected error occurred. Please refresh the page.');
    };

    // Add global error listener
    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  // Special error handling just for the landing page
  const handleLandingPageError = (error) => {
    console.error('Landing page error:', error);
    // Don't set app error - just let the simplified landing page version show
  };

  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          {appError ? (
            <Container className="text-center mt-5">
              <h2>Something went wrong</h2>
              <p>{appError}</p>
              <Button onClick={() => window.location.reload()}>Refresh</Button>
            </Container>
          ) : (
            <AppRoutes />
          )}
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App; 