import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister, checkAuthStatus } from '../services/api';

// Create the context
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true to check initial status

  // Function to check authentication status on initial load
  const verifyAuth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await checkAuthStatus();
      if (response && response.success) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // Expected if not logged in (e.g., 401 error)
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await apiLogin(credentials);
      if (response && response.success) {
        setUser(response.user);
        setLoading(false);
        return response; // Return the full response on success
      } else {
        throw new Error(response?.message || 'Login failed');
      }
    } catch (error) {
      setUser(null);
      setLoading(false);
      console.error('Login error in context:', error);
      throw error; // Re-throw error to be caught by the calling component
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await apiRegister(userData);
       // Registration might not automatically log the user in, depending on backend setup.
       // If it does, uncomment the setUser line. For now, assume user needs to login separately.
      // if (response && response.success && response.user) {
      //   setUser(response.user);
      // }
      setLoading(false);
      return response; // Return the full response
    } catch (error) {
      setLoading(false);
      console.error('Registration error in context:', error);
      throw error; // Re-throw error
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
    } catch (error) {
      // Log error but proceed with clearing user state
      console.error('Logout API call failed, clearing session locally:', error);
    } finally {
      // Clear user state
      setUser(null);
      
      // Clear any stored tokens or user data in local/session storage
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      
      // Clear any other stored auth tokens
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      setLoading(false);
      
      // Force redirect to login page
      window.location.href = '/login';
    }
  };

  // The context value
  const value = {
    user,
    setUser, // Allow direct setting if needed (e.g., after profile update)
    loading,
    login,
    logout,
    register,
    verifyAuth // Expose verifyAuth if manual re-check is needed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 