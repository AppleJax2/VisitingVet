import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  register as apiRegister, 
  checkAuthStatus, 
  verifyMFALogin 
} from '../services/api';

// Create the context
const AuthContext = createContext(null);

// Default empty user object with required properties to prevent undefined errors
const DEFAULT_USER = null;

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [loading, setLoading] = useState(true); // Start as true to check initial status
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Function to check authentication status on initial load
  const verifyAuth = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await checkAuthStatus();
      if (response && response.success) {
        setUser(response.user);
      } else {
        setUser(DEFAULT_USER);
      }
    } catch (error) {
      // Expected if not logged in (e.g., 401 error)
      setUser(DEFAULT_USER);
      setAuthError(error.message || 'Authentication failed');
      console.log('Auth verification failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  // Handle MFA verification during login
  const handleMfaVerification = async (userId, mfaToken) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await verifyMFALogin(userId, mfaToken);
      if (response && response.success) {
        setUser(response.user);
        setMfaRequired(false);
        setMfaUserId(null);
        setLoading(false);
        return response;
      } else {
        throw new Error(response?.message || 'MFA verification failed');
      }
    } catch (error) {
      setLoading(false);
      setAuthError(error.message || 'MFA verification failed');
      console.error('MFA verification error in context:', error);
      throw error;
    }
  };

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await apiLogin(credentials);
      
      // Check if MFA is required
      if (response && !response.success && response.mfaRequired) {
        setMfaRequired(true);
        setMfaUserId(response.userId);
        setLoading(false);
        return response;
      }
      
      if (response && response.success) {
        setUser(response.user);
        setMfaRequired(false);
        setMfaUserId(null);
        setLoading(false);
        return response; // Return the full response on success
      } else {
        throw new Error(response?.message || 'Login failed');
      }
    } catch (error) {
      setUser(DEFAULT_USER);
      setLoading(false);
      setAuthError(error.message || 'Login failed');
      console.error('Login error in context:', error);
      throw error; // Re-throw error to be caught by the calling component
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
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
      setAuthError(error.message || 'Registration failed');
      console.error('Registration error in context:', error);
      throw error; // Re-throw error
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await apiLogout();
    } catch (error) {
      // Log error but proceed with clearing user state
      console.error('Logout API call failed, clearing session locally:', error);
      setAuthError(error.message || 'Logout failed, but session was cleared locally');
    } finally {
      // Clear user state
      setUser(DEFAULT_USER);
      setMfaRequired(false);
      setMfaUserId(null);
      
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
    verifyAuth, // Expose verifyAuth if manual re-check is needed
    mfaRequired,
    handleMfaVerification,
    authError
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