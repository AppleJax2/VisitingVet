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
    const response = await api.post('/profiles/visiting-vet/services', profileData);
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

export const fetchUserReminders = async (filters = {}) => {
  try {
    // Filters could include { isComplete: boolean, petId: string }
    const response = await api.get('/reminders', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Fetch reminders error:', error.response?.data || error.message);
    // Return default structure on error to prevent crashes in component
    // return { success: false, reminders: [], error: error.response?.data?.error || 'Failed to fetch reminders' };
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

export const addPet = async (petData) => {
  try {
    // Assuming the backend route is POST /pets
    const response = await api.post('/pets', petData);
    return response.data;
  } catch (error) {
    console.error('Add pet error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to add pet');
  }
};

// Function to fetch details for a single pet (may be needed later)
export const fetchPetById = async (petId) => {
  try {
    const response = await api.get(`/pets/${petId}`);
    return response.data;
  } catch (error) {
    console.error(`Fetch pet ${petId} error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch pet details');
  }
};

// Function to update a pet (may be needed later)
export const updatePet = async (petId, petData) => {
  try {
    const response = await api.put(`/pets/${petId}`, petData);
    return response.data; // Expects { success: true, pet: updatedPet } or { success: false, error: ... }
  } catch (error) {
    console.error('API Error updating pet:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.error || error.message || 'Network Error' };
  }
};

// Function to delete a pet (may be needed later)
export const deletePet = async (petId) => {
  try {
    const response = await api.delete(`/pets/${petId}`);
    return response.data; // Expects { success: true } or { success: false, error: ... }
  } catch (error) {
    console.error('API Error deleting pet:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.error || error.message || 'Network Error' };
  }
};

// Reminder management
export const addReminder = async (reminderData) => {
  try {
    const response = await api.post('/reminders', reminderData);
    return response.data;
  } catch (error) {
    console.error('Add reminder error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to add reminder');
  }
};

export const updateReminder = async (reminderId, updateData) => {
  try {
    const response = await api.put(`/reminders/${reminderId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Update reminder ${reminderId} error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update reminder');
  }
};

export const deleteReminder = async (reminderId) => {
  try {
    const response = await api.delete(`/reminders/${reminderId}`);
    return response.data;
  } catch (error) {
    console.error(`Delete reminder ${reminderId} error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete reminder');
  }
};

// Clinic related functions
export const fetchClinicAppointments = async (clinicId, date) => {
  try {
    // Assuming clinicId might be inferred on backend or passed explicitly
    // Backend needs to handle filtering by date and potentially by provider within the clinic
    const response = await api.get(`/clinics/appointments`, { params: { date } }); 
    return response.data;
  } catch (error) {
    console.error('Fetch clinic appointments error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch clinic appointments');
  }
};

export const fetchClinicStaff = async (clinicId) => {
    try {
        // Backend needs to return staff associated with the clinic
        const response = await api.get(`/clinics/staff`);
        return response.data;
    } catch (error) {
        console.error('Fetch clinic staff error:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch clinic staff');
    }
};

// TODO: Add functions for clinic stats, inventory, reports, adding staff/appointments etc.

/**
 * Fetch clinic statistics (appointments, providers, clients, earnings)
 * @param {string} clinicId - The ID of the clinic
 * @returns {Promise<Object>} Response with clinic stats
 */
export const fetchClinicStats = async (clinicId) => {
  try {
    const response = await api.get(`/clinics/stats`);
    return response.data;
  } catch (error) {
    console.error('Fetch clinic stats error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch clinic statistics');
  }
};

/**
 * Fetch clinic inventory and alerts
 * @param {string} clinicId - The ID of the clinic
 * @returns {Promise<Object>} Response with clinic inventory data
 */
export const fetchClinicInventory = async (clinicId) => {
  try {
    const response = await api.get(`/clinics/inventory`);
    return response.data;
  } catch (error) {
    console.error('Fetch clinic inventory error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch clinic inventory');
  }
};

/**
 * Fetch clinic revenue data for charts
 * @param {string} clinicId - The ID of the clinic
 * @returns {Promise<Object>} Response with revenue data
 */
export const fetchClinicRevenueData = async (clinicId) => {
  try {
    const response = await api.get(`/clinics/revenue-data`);
    return response.data;
  } catch (error) {
    console.error('Fetch clinic revenue data error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch clinic revenue data');
  }
};

/**
 * Fetch clinic service distribution data for charts
 * @param {string} clinicId - The ID of the clinic
 * @returns {Promise<Object>} Response with service distribution data
 */
export const fetchClinicServiceData = async (clinicId) => {
  try {
    const response = await api.get(`/clinics/service-data`);
    return response.data;
  } catch (error) {
    console.error('Fetch clinic service data error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch clinic service data');
  }
};

/**
 * Fetch top rated veterinarians for pet owner dashboard
 * @param {Object} location - User location data
 * @returns {Promise<Object>} Response with top rated vets
 */
export const fetchTopRatedVets = async (location) => {
  try {
    const response = await api.get('/profiles/visiting-vet/top-rated', { params: { location } });
    return response.data;
  } catch (error) {
    console.error('Fetch top rated vets error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch top rated vets');
  }
};

/**
 * Fetch provider statistics for dashboard
 * @param {string} providerId - The ID of the provider
 * @returns {Promise<Object>} Response with provider stats
 */
export const fetchProviderStats = async (providerId) => {
  try {
    const response = await api.get(`/profiles/visiting-vet/stats`);
    return response.data;
  } catch (error) {
    console.error('Fetch provider stats error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch provider statistics');
  }
};

/**
 * Fetch provider revenue data for charts
 * @param {string} providerId - The ID of the provider
 * @param {string} timeRange - Time range to fetch data for ('week', 'month')
 * @returns {Promise<Object>} Response with revenue data
 */
export const fetchProviderRevenueData = async (providerId, timeRange = 'week') => {
  try {
    const response = await api.get(`/profiles/visiting-vet/revenue-data`, { params: { timeRange } });
    return response.data;
  } catch (error) {
    console.error('Fetch provider revenue data error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch provider revenue data');
  }
};

/**
 * Fetch provider appointment type distribution for charts
 * @param {string} providerId - The ID of the provider
 * @returns {Promise<Object>} Response with appointment type distribution
 */
export const fetchProviderAppointmentTypes = async (providerId) => {
  try {
    const response = await api.get(`/profiles/visiting-vet/appointment-types`);
    return response.data;
  } catch (error) {
    console.error('Fetch provider appointment types error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch provider appointment types');
  }
};

/**
 * Fetch provider recent activity
 * @param {string} providerId - The ID of the provider
 * @returns {Promise<Object>} Response with recent activity data
 */
export const fetchProviderActivity = async (providerId) => {
  try {
    const response = await api.get(`/profiles/visiting-vet/activity`);
    return response.data;
  } catch (error) {
    console.error('Fetch provider activity error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch provider activity');
  }
};

// --- Admin API Functions ---

export const adminGetAllUsers = async (page = 1, limit = 25, filters = {}) => {
  try {
    const response = await api.get('/admin/users', { params: { page, limit, ...filters } });
    return response.data; // Should include data and pagination
  } catch (error) {
    console.error('Admin get users error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch users');
  }
};

export const adminGetUserDetails = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Admin get user details error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch user details');
  }
};

export const adminBanUser = async (userId, reason) => {
  try {
    const response = await api.put(`/admin/users/${userId}/ban`, { reason });
    return response.data;
  } catch (error) {
    console.error('Admin ban user error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to ban user');
  }
};

export const adminUnbanUser = async (userId) => {
  try {
    const response = await api.put(`/admin/users/${userId}/unban`);
    return response.data;
  } catch (error) {
    console.error('Admin unban user error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to unban user');
  }
};

export const adminVerifyUser = async (userId) => {
  try {
    const response = await api.put(`/admin/users/${userId}/verify`);
    return response.data;
  } catch (error) {
    console.error('Admin verify user error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to verify user');
  }
};

export const adminGetPendingVerifications = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/admin/verifications/pending', { params: { page, limit } });
    return response.data; // Should include data and pagination
  } catch (error) {
    console.error('Admin get pending verifications error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch pending verifications');
  }
};

export const adminApproveVerification = async (requestId) => {
  try {
    const response = await api.put(`/admin/verifications/${requestId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Admin approve verification error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to approve verification');
  }
};

export const adminRejectVerification = async (requestId, reason) => {
  try {
    const response = await api.put(`/admin/verifications/${requestId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Admin reject verification error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to reject verification');
  }
};

/**
 * Save annotations for a document in a verification request
 * @param {string} requestId - The ID of the verification request
 * @param {string} documentId - The ID of the document
 * @param {Array} annotations - The annotations to save
 * @returns {Promise<Object>} Response with success status
 */
export const adminSaveDocumentAnnotations = async (requestId, documentId, annotations) => {
  try {
    const response = await api.put(`/admin/verifications/${requestId}/documents/${documentId}/annotations`, { annotations });
    return response.data;
  } catch (error) {
    console.error('Admin save document annotations error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to save document annotations');
  }
};

export const adminCreateUser = async (userData) => {
  try {
    const response = await api.post('/admin/users/create', userData);
    return response.data; // Assuming backend returns { success: true, user: ... } or { success: false, error: ... }
  } catch (error) {
    console.error('Admin create user error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to create user');
  }
};

export const adminGetActionLogs = async (page = 1, limit = 50, filters = {}) => {
  try {
    const response = await api.get('/admin/logs', { params: { page, limit, ...filters } });
    return response.data; // Should include data and pagination
  } catch (error) {
    console.error('Admin get action logs error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch action logs');
  }
};

/**
 * Get active user sessions with filtering and pagination
 * @param {number} page - Page number
 * @param {number} limit - Limit per page
 * @param {object} filters - Filters like search, role
 * @returns {Promise<Object>} Response with sessions data
 */
export const adminGetActiveSessions = async (page = 1, limit = 20, filters = {}) => {
  try {
    const response = await api.get('/admin/sessions', { params: { page, limit, ...filters } });
    return response.data; // Should include data and pagination
  } catch (error) {
    console.error('Admin get sessions error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch active sessions');
  }
};

/**
 * Terminate a user session by ID
 * @param {string} sessionId - ID of the session to terminate
 * @returns {Promise<Object>} Response with success status
 */
export const adminTerminateSession = async (sessionId) => {
  try {
    const response = await api.delete(`/admin/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Admin terminate session error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to terminate session');
  }
};

/**
 * Get all roles in the system
 * @returns {Promise<Object>} Response with roles data
 */
export const adminGetRoles = async () => {
  try {
    const response = await api.get('/admin/roles');
    return response.data;
  } catch (error) {
    console.error('Admin get roles error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch roles');
  }
};

/**
 * Create a new role
 * @param {Object} roleData - Role data including name, description, and permissions
 * @returns {Promise<Object>} Response with created role
 */
export const adminCreateRole = async (roleData) => {
  try {
    const response = await api.post('/admin/roles', roleData);
    return response.data;
  } catch (error) {
    console.error('Admin create role error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to create role');
  }
};

/**
 * Update an existing role
 * @param {string} roleId - ID of the role to update
 * @param {Object} roleData - Updated role data
 * @returns {Promise<Object>} Response with updated role
 */
export const adminUpdateRole = async (roleId, roleData) => {
  try {
    const response = await api.put(`/admin/roles/${roleId}`, roleData);
    return response.data;
  } catch (error) {
    console.error('Admin update role error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update role');
  }
};

/**
 * Delete a role
 * @param {string} roleId - ID of the role to delete
 * @returns {Promise<Object>} Response with success status
 */
export const adminDeleteRole = async (roleId) => {
  try {
    const response = await api.delete(`/admin/roles/${roleId}`);
    return response.data;
  } catch (error) {
    console.error('Admin delete role error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete role');
  }
};

export const adminCreateUpdateProfile = async (userId, profileData) => {
  try {
    // Use PUT to update the profile for a specific user ID
    const response = await api.put(`/admin/users/${userId}/profile`, profileData);
    return response.data; // Assuming backend confirms success/returns updated profile
  } catch (error) {
    console.error(`Admin update profile for user ${userId} error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update profile via admin');
  }
};

// --- Public/General API Functions ---

// Add the search function
export const searchProviders = async (params = {}) => {
  try {
    // Params could include: page, limit, search, animalTypes, specialtyServices, location
    const response = await api.get('/profiles/visiting-vet/search', { params });
    return response.data; // Expected format: { success: true, data: [], pagination: {} }
  } catch (error) {
    console.error('Search providers error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to search for providers');
  }
};

// --- User Profile Management ---

/**
 * Update user details (name, notifications, etc) for the logged-in user
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Response with updated user
 */
export const updateUserDetails = async (userData) => {
  try {
    const response = await api.put('/users/me', userData);
    return response.data;
  } catch (error) {
    console.error('Update user details error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update user details');
  }
};

/**
 * Change the password for the logged-in user
 * @param {Object} passwordData - Object with currentPassword and newPassword
 * @returns {Promise<Object>} Response with success status
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Change password error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to change password');
  }
};

// MFA related functions
export const setupMFA = async () => {
  try {
    const response = await api.post('/auth/mfa/setup');
    return response.data;
  } catch (error) {
    console.error('MFA setup error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to setup MFA');
  }
};

export const verifyAndEnableMFA = async (token) => {
  try {
    const response = await api.post('/auth/mfa/verify', { token });
    return response.data;
  } catch (error) {
    console.error('MFA verification error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to verify MFA');
  }
};

export const disableMFA = async (token) => {
  try {
    const response = await api.post('/auth/mfa/disable', { token });
    return response.data;
  } catch (error) {
    console.error('MFA disable error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to disable MFA');
  }
};

export const verifyMFALogin = async (userId, mfaToken) => {
  try {
    const response = await api.post('/auth/mfa/verify-login', { userId, mfaToken });
    return response.data;
  } catch (error) {
    console.error('MFA login verification error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to verify MFA during login');
  }
};

export const requestPasswordReset = async (emailData) => {
  try {
    const response = await api.post('/auth/forgot-password', emailData);
    return response.data;
  } catch (error) {
    console.error('Password reset request error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to request password reset');
  }
};

export const resetPassword = async (token, passwordData) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, passwordData);
    return response.data;
  } catch (error) {
    console.error('Password reset error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to reset password');
  }
};

// ---------------- Conversation API ----------------

/**
 * Get all conversations for the logged-in user
 */
export const getConversations = async () => {
  try {
    const response = await api.get('/conversations');
    return response.data.data; // Assuming response structure { success: true, data: [...] }
  } catch (error) {
    console.error('Get conversations error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get conversations');
  }
};

/**
 * Get messages for a specific conversation with pagination
 * @param {string} conversationId - The ID of the conversation
 * @param {number} limit - Max number of messages to fetch
 * @param {string|null} beforeMessageId - ID of the message to fetch messages before (for pagination)
 */
export const getMessagesForConversation = async (conversationId, limit = 30, beforeMessageId = null) => {
  try {
    let url = `/conversations/${conversationId}/messages?limit=${limit}`;
    if (beforeMessageId) {
        url += `&before=${beforeMessageId}`;
    }
    const response = await api.get(url);
    return response.data.data; // Assuming response structure { success: true, data: [...] }
  } catch (error) {
    console.error('Get messages error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get messages');
  }
};

/**
 * Start a new conversation (or get existing) with a recipient
 * @param {string} recipientId - The ID of the user to start conversation with
 */
export const startConversation = async (recipientId) => {
  try {
    const response = await api.post('/conversations/start', { recipientId });
    return response.data.data; // Assuming response structure { success: true, data: {...} }
  } catch (error) {
    console.error('Start conversation error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to start conversation');
  }
};

// ---------------- Video Conferencing API ----------------

/**
 * Get a meeting token and room URL for a Daily video call
 * @param {string} roomName - The desired room name (e.g., derived from appointment ID)
 */
export const getVideoToken = async (roomName) => {
  try {
    const response = await api.post('/video/token', { roomName });
    return response.data; // Should return { success: true, token: string, roomUrl: string }
  } catch (error) {
    console.error('Get video token error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get video token');
  }
};

/**
 * Get list of recordings for a specific room/appointment
 * @param {string} roomName - The room name (likely appointment ID)
 */
export const getRecordingsForRoom = async (roomName) => {
  try {
    const response = await api.get(`/video/recordings/${roomName}`);
    return response.data; // Should return { success: true, count: number, data: [...] }
  } catch (error) {
    console.error('Get recordings error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get recordings');
  }
};

/**
 * Get a temporary access link for a specific recording
 * @param {string} recordingId - The ID of the Daily recording
 */
export const getRecordingAccessLink = async (recordingId) => {
  try {
    const response = await api.get(`/video/recordings/link/${recordingId}`);
    return response.data; // Should return { success: true, accessLink: string }
  } catch (error) {
    console.error('Get recording link error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to get recording link');
  }
};

export default api; 

/**
 * Fetch verification request history (paginated, filterable)
 * @param {number} page - Page number
 * @param {number} limit - Results per page
 * @param {object} filters - Filter object (status, userId, reviewerId, startDate, endDate, search)
 * @returns {Promise<Object>} Response with data and pagination
 */
export const adminGetVerificationHistory = async (page = 1, limit = 25, filters = {}) => {
  try {
    const response = await api.get('/admin/verifications/history', { params: { page, limit, ...filters } });
    return response.data;
  } catch (error) {
    console.error('Admin get verification history error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch verification history');
  }
};

// --- Admin Analytics API Functions ---

/**
 * Fetch user growth metrics.
 * @param {object} params - Optional query parameters (startDate, endDate).
 * @returns {Promise<Object>} Response with user growth data.
 */
export const adminGetUserGrowthMetrics = async (params = {}) => {
  try {
    const response = await api.get('/admin/analytics/user-growth', { params });
    return response.data;
  } catch (error) {
    console.error('Admin get user growth metrics error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch user growth metrics');
  }
};

/**
 * Fetch verification rate metrics.
 * @param {object} params - Optional query parameters (startDate, endDate).
 * @returns {Promise<Object>} Response with verification rate data.
 */
export const adminGetVerificationRateMetrics = async (params = {}) => {
  try {
    const response = await api.get('/admin/analytics/verification-rate', { params });
    return response.data;
  } catch (error) {
    console.error('Admin get verification rate metrics error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch verification rate metrics');
  }
};

/**
 * Fetch service usage metrics.
 * @param {object} params - Optional query parameters (startDate, endDate).
 * @returns {Promise<Object>} Response with service usage data.
 */
export const adminGetServiceUsageMetrics = async (params = {}) => {
  try {
    const response = await api.get('/admin/analytics/service-usage', { params });
    return response.data;
  } catch (error) {
    console.error('Admin get service usage metrics error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch service usage metrics');
  }
};

// --- End Admin API Functions --- 

// --- Admin Settings API Functions --- 

/**
 * Get all editable application settings (Admin only)
 * @returns {Promise<Object>} Response with settings data
 */
export const adminGetSettings = async () => {
  try {
    const response = await api.get('/settings'); // Endpoint is /api/v1/settings
    return response.data; // Expects { success: true, count: number, data: [...] }
  } catch (error) {
    console.error('Admin get settings error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch settings');
  }
};

/**
 * Update a specific application setting (Admin only)
 * @param {string} key - The key of the setting to update
 * @param {any} value - The new value for the setting
 * @returns {Promise<Object>} Response with updated setting data
 */
export const adminUpdateSetting = async (key, value) => {
  try {
    const response = await api.put(`/settings/${key}`, { value });
    return response.data; // Expects { success: true, data: { updatedSetting } }
  } catch (error) {
    console.error(`Admin update setting '${key}' error:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update setting');
  }
};

// --- Upload Service --- 
export const uploadPetImage = async (petId, imageFile) => {
    const formData = new FormData();
    formData.append('petImage', imageFile); // 'petImage' must match the field name expected by multer

    try {
        const response = await api.post(`/upload/pet-image/${petId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Expects { success: true, data: { imageUrl: '...' } } or { success: false, error: ... }
    } catch (error) {
        console.error('API Error uploading pet image:', error.response?.data || error.message);
        return { success: false, error: error.response?.data?.error || error.message || 'Network Error' };
    }
};

// --- Vaccination Records --- 
// ... other functions ... 