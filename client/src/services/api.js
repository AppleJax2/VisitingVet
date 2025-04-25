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

// Availability management
export const getMyAvailability = async () => {
  try {
    const response = await api.get('/availability/me');
    return response.data;
  } catch (error) {
    console.error('Get availability error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get availability');
  }
};

export const updateAvailability = async (availabilityData) => {
  try {
    const response = await api.post('/availability/me', availabilityData);
    return response.data;
  } catch (error) {
    console.error('Update availability error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update availability');
  }
};

export const getProviderAvailability = async (profileId) => {
  try {
    const response = await api.get(`/availability/${profileId}`);
    return response.data;
  } catch (error) {
    console.error('Get provider availability error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get provider availability');
  }
};

// Appointment management
export const requestAppointment = async (appointmentData) => {
  try {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Request appointment error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to request appointment');
  }
};

export const getMyPetOwnerAppointments = async () => {
  try {
    const response = await api.get('/appointments/my-appointments');
    return response.data;
  } catch (error) {
    console.error('Get appointments error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get appointments');
  }
};

export const getMyAppointmentsProvider = async (status) => {
  try {
    const url = status ? `/appointments/provider?status=${status}` : '/appointments/provider';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Get provider appointments error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get provider appointments');
  }
};

export const updateAppointmentStatus = async (appointmentId, status, additionalData = {}) => {
  try {
    const response = await api.put(`/appointments/${appointmentId}/status`, { 
      status,
      ...additionalData
    });
    return response.data;
  } catch (error) {
    console.error('Update appointment status error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update appointment status');
  }
};

export const cancelAppointmentByPetOwner = async (appointmentId, cancellationReason) => {
  try {
    const response = await api.put(`/appointments/${appointmentId}/cancel`, { 
      cancellationReason 
    });
    return response.data;
  } catch (error) {
    console.error('Cancel appointment error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to cancel appointment');
  }
};

export const getAppointmentDetails = async (appointmentId) => {
  try {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error('Get appointment details error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get appointment details');
  }
};

// Notifications API
export const getUserNotifications = async (isRead) => {
  try {
    const url = isRead !== undefined ? `/notifications?isRead=${isRead}` : '/notifications';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Get notifications error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get notifications');
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Mark notification read error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to mark notification as read');
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Mark all notifications read error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to mark all notifications as read');
  }
};

// Dashboard data functions
export const fetchPetOwnerDashboardData = async () => {
  try {
    const response = await api.get('/dashboard/pet-owner');
    return response.data;
  } catch (error) {
    console.error('Fetch dashboard data error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch dashboard data');
  }
};

export const fetchUserPets = async () => {
  try {
    const response = await api.get('/pets');
    return response.data;
  } catch (error) {
    console.error('Fetch pets error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch pets');
  }
};

export const fetchUserReminders = async () => {
  try {
    const response = await api.get('/reminders');
    return response.data;
  } catch (error) {
    console.error('Fetch reminders error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch reminders');
  }
};

export const fetchUpcomingAppointments = async (limit = 3) => {
  try {
    const response = await api.get(`/appointments/my-appointments/upcoming?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Fetch upcoming appointments error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch upcoming appointments');
  }
};

export default api; 