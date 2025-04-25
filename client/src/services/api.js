import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important to send cookies
});

// Authentication service functions
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    // Handle or throw error
    console.error('Registration error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Registration failed');
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Login failed');
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Logout failed');
  }
};

export const checkAuthStatus = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    // This will fail if not authenticated (401), which is expected
    if (error.response?.status !== 401) {
        console.error('Auth check error:', error.response?.data || error.message);
    }
    // Return null or indicate not authenticated
    return null;
  }
};

// Profile management
export const createUpdateProfile = async (profileData) => {
  try {
    const response = await api.post('/profiles/visiting-vet', profileData);
    return response.data;
  } catch (error) {
    console.error('Profile update error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Profile update failed');
  }
};

export const getMyProfile = async () => {
  try {
    const response = await api.get('/profiles/visiting-vet/me');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get profile');
  }
};

export const getProfileById = async (profileId) => {
  try {
    const response = await api.get(`/profiles/visiting-vet/${profileId}`);
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get profile');
  }
};

export const listProfiles = async () => {
  try {
    const response = await api.get('/profiles/visiting-vet');
    return response.data;
  } catch (error) {
    console.error('List profiles error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to list profiles');
  }
};

// Service management
export const createService = async (serviceData) => {
  try {
    const response = await api.post('/profiles/visiting-vet/services', serviceData);
    return response.data;
  } catch (error) {
    console.error('Create service error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to create service');
  }
};

export const updateService = async (serviceId, serviceData) => {
  try {
    const response = await api.put(`/profiles/visiting-vet/services/${serviceId}`, serviceData);
    return response.data;
  } catch (error) {
    console.error('Update service error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update service');
  }
};

export const deleteService = async (serviceId) => {
  try {
    const response = await api.delete(`/profiles/visiting-vet/services/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error('Delete service error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete service');
  }
};

export const getServicesByProfile = async (profileId) => {
  try {
    const response = await api.get(`/profiles/visiting-vet/${profileId}/services`);
    return response.data;
  } catch (error) {
    console.error('Get services error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get services');
  }
};

export default api; 