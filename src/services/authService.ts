import api from './api';
import { User } from '../types/user';

interface AuthResponse {
  token: string;
  user: User;
}

interface UserCreationResponse {
  message: string;
  user: User;
}

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('auth/login', { username, password });
    
    // Store the token in localStorage
    if (response.data && typeof response.data === 'object' && 'token' in response.data) {
      localStorage.setItem('token', response.data.token as string);
    }
    
    return response.data as AuthResponse;
  },
  
  logout: (): void => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('auth/me');
    return response.data as User;
  },
  
  createAdminUser: async (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
  }): Promise<UserCreationResponse> => {
    // Always set role to 'admin'
    const payload = {
      ...userData,
      role: 'admin'
    };
    
    const response = await api.post('auth/create-user', payload);
    return response.data as UserCreationResponse;
  },
  
  resetAdminPasswords: async (): Promise<{ message: string }> => {
    const response = await api.post('auth/reset-admin-passwords');
    return response.data as { message: string };
  },
  
  getAdminUsers: async (): Promise<User[]> => {
    const response = await api.get('users/admins');
    return response.data as User[];
  }
}; 