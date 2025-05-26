import axios from 'axios';
import store from '../store';
import { logout } from '../store/slices/authSlice';

// Using relative URL since we have a proxy configured in setupProxy.js
const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token && config.headers) {
      config.headers['x-auth-token'] = token;
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to transform _id to id and handle auth errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`API Response (${response.status}): ${response.config.method?.toUpperCase()} ${response.config.url}`);
    
    const transformData = <T>(data: T): T => {
      if (Array.isArray(data)) {
        return data.map((item) => transformData(item)) as T;
      }
      if (data && typeof data === 'object') {
        const transformed = { ...data } as { [key: string]: any };
        if ('_id' in transformed) {
          transformed.id = transformed._id;
          delete transformed._id;
        }
        return transformed as T;
      }
      return data;
    };

    response.data = transformData(response.data);
    return response;
  },
  (error) => {
    // Log failed responses
    console.error(`API Error (${error.response?.status || 'Network Error'}): ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    if (error.response?.data) {
      console.error('Error response data:', error.response.data);
    }

    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error:', error.response.data);
      
      // If the error message contains "Token is not valid", log out the user
      if (error.response.data.message === 'Token is not valid') {
        console.log('Invalid token detected, logging out...');
        const lastUserRole = localStorage.getItem('lastUserRole');
        store.dispatch(logout());
        
        // Redirect to appropriate login page based on last user role
        if (typeof window !== 'undefined') {
          if (lastUserRole === 'admin' || lastUserRole === 'superAdmin') {
            window.location.href = '/admin-login';
          } else {
            window.location.href = '/';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 