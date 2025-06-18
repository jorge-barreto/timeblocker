import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  // Backend validation errors
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Array of validation errors
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map((err: any) => err.msg).join(', ');
  }
  
  // Single validation error
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  // HTTP status errors
  if (error.response?.status) {
    switch (error.response.status) {
      case 400: return 'Invalid request. Please check your input.';
      case 403: return 'Access denied. You don\'t have permission for this action.';
      case 404: return 'Resource not found.';
      case 409: return 'Conflict. The operation cannot be completed.';
      case 422: return 'Validation failed. Please check your input.';
      case 500: return 'Server error. Please try again later.';
      default: return `Request failed with status ${error.response.status}`;
    }
  }
  
  // Network errors
  if (error.code === 'NETWORK_ERROR' || !error.response) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Response interceptor to handle auth errors and show toast notifications
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Show error toast for all other errors
    const errorMessage = getErrorMessage(error);
    toast.error(errorMessage);
    
    return Promise.reject(error);
  }
);

// Success notification helper
export const showSuccessToast = (message: string) => {
  toast.success(message);
};

// Info notification helper  
export const showInfoToast = (message: string) => {
  toast.info(message);
};