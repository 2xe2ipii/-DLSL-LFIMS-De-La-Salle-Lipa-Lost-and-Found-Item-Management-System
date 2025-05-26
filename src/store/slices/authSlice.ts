import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user';
import { AuthResponse, UserResponse } from '../../types/api';
import api from '../../services/api';
import store from '../../store';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Async thunks
export const login = createAsyncThunk<
  AuthResponse,
  { username: string; password: string; role: 'superAdmin' | 'admin' | 'viewer' },
  { rejectValue: string }
>(
  'auth/login',
  async ({ username, password, role }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { username, password, role });
      // Save token to localStorage
      const data = response.data as AuthResponse;
      localStorage.setItem('token', data.token);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk<
  AuthResponse,
  { username: string; email: string; password: string; name: string; role: 'student' | 'faculty' | 'viewer' },
  { rejectValue: string }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      // Save token to localStorage
      const data = response.data as AuthResponse;
      localStorage.setItem('token', data.token);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const createUser = createAsyncThunk<
  UserResponse,
  { username: string; email: string; password: string; name: string; role: 'admin' | 'superAdmin' | 'viewer' },
  { rejectValue: string }
>(
  'auth/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Creating user with data:', userData);
      // Ensure we're using the full path with /api prefix since that's configured in the proxy
      const response = await api.post('/api/auth/create-user', userData);
      console.log('User creation response:', response.data);
      return response.data as UserResponse;
    } catch (error: any) {
      console.error('User creation failed:', error.response?.data || error);
      console.error('Error details:', error.response?.status, error.response?.statusText);
      return rejectWithValue(error.response?.data?.message || 'User creation failed');
    }
  }
);

export const resetAdminPasswords = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>(
  'auth/resetAdminPasswords',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Resetting admin passwords');
      const response = await api.post('/api/auth/reset-admin-passwords');
      console.log('Reset passwords response:', response.data);
      return response.data as { message: string };
    } catch (error: any) {
      console.error('Password reset failed:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

export const loadUser = createAsyncThunk<
  UserResponse,
  void,
  { rejectValue: string }
>(
  'auth/loadUser',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Check if token exists in localStorage (it might have been added after the store was initialized)
      const storedToken = localStorage.getItem('token');
      const currentState = store.getState();
      
      // If there's a token in localStorage but not in the state, update the state first
      if (storedToken && !currentState.auth.token) {
        // We don't want to call the API with an invalid token state
        // So we'll update the auth state manually before proceeding
        dispatch(updateToken(storedToken));
      }
      
      const response = await api.get('/api/auth/me');
      console.log('Load user response:', response.data);
      return response.data as UserResponse;
    } catch (error: any) {
      console.error('Failed to load user:', error.response?.data || error);
      return rejectWithValue(error.response?.data?.message || 'Failed to load user');
    }
  }
);

export const changePassword = createAsyncThunk<
  { message: string },
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data as { message: string };
    } catch (error: any) {
      console.error('Password change error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

// Initialize state from localStorage
const token = localStorage.getItem('token');

const initialState: AuthState = {
  user: null,
  token: token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Remove token from localStorage
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create User (Admin/SuperAdmin)
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset Admin Passwords
      .addCase(resetAdminPasswords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetAdminPasswords.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetAdminPasswords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, updateUserProfile, updateToken } = authSlice.actions;

export default authSlice.reducer; 