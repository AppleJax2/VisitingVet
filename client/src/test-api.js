// Test API connection
import axios from 'axios';

// Check the API URL - log it for debugging
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('API URL:', API_URL);
console.log('API URL length:', API_URL.length);
console.log('API URL trimmed:', API_URL.trim());
console.log('API URL trimmed length:', API_URL.trim().length);

// Check if there's a trailing space or other whitespace
if (API_URL !== API_URL.trim()) {
  console.error('⚠️ WARNING: API_URL contains leading or trailing whitespace!');
  console.error('This can cause authentication and API request failures.');
}

// Create a test function
export const testApiConnection = async () => {
  try {
    // Try to make a request to a public endpoint
    const response = await axios.get(`${API_URL.trim()}/auth/me`, {
      withCredentials: true,
    });
    console.log('API Connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    // Log detailed error information
    console.error('API Connection error:', {
      url: `${API_URL.trim()}/auth/me`,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}; 