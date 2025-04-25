import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// Basic protected route component (can be enhanced later)
// For now, DashboardPage handles its own auth check
// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = // ... logic to check auth state ...
//   return isAuthenticated ? children : <Navigate to="/login" />;
// };

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard"
          element={
            // <ProtectedRoute>
              <DashboardPage />
            // </ProtectedRoute>
          }
        />
        {/* Redirect base path to login or dashboard depending on auth status */}
        {/* For simplicity now, redirect to login */}
        <Route path="/" element={<Navigate to="/login" />} />
         {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App; 