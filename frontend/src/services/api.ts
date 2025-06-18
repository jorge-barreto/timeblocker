import axios from 'axios';
import { toast } from 'react-toastify';

// Dynamic API URL detection for local network testing
const getApiBaseUrl = () => {
  // Use environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For development: detect if we're accessing via IP address
  const hostname = window.location.hostname;
  
  // If accessing via IP address (192.168.x.x, 10.x.x.x, etc.), use same IP for API
  if (hostname.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./)) {
    return `http://${hostname}:3000/api`;
  }
  
  // Default to localhost for local development
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging for API URL
console.log('API Base URL:', API_BASE_URL);
console.log('Current hostname:', window.location.hostname);

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