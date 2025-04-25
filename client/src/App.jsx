import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProviderProfileEditPage from './pages/ProviderProfileEditPage';
import ProviderProfileViewPage from './pages/ProviderProfileViewPage';
import ProviderSearchPage from './pages/ProviderSearchPage';
import MyPetOwnerAppointmentsPage from './pages/MyPetOwnerAppointmentsPage';
import ProviderAppointmentsPage from './pages/ProviderAppointmentsPage';
import LandingPage from './pages/LandingPage';
import NotificationBell from './components/NotificationBell';
import './App.css';

// Basic protected route component (can be enhanced later)
// For now, DashboardPage handles its own auth check
// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = // ... logic to check auth state ...
//   return isAuthenticated ? children : <Navigate to="/login" />;
// };

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/providers/:id" element={<ProviderProfileViewPage />} />
          <Route path="/search-providers" element={<ProviderSearchPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/provider-profile" element={<ProviderProfileEditPage />} />
          <Route path="/my-appointments" element={<MyPetOwnerAppointmentsPage />} />
          <Route path="/provider-appointments" element={<ProviderAppointmentsPage />} />
          
          {/* Handle 404 - can be replaced with a proper NotFound component */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 