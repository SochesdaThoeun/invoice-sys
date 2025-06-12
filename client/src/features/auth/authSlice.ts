import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from './services/authService';
import type { 
  AuthState, 
  LoginRequest, 
  RegisterRequest,
  User, 
  ChangePasswordRequest
} from './models/authModels';

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null
};

// Async thunks
export const login = createAsyncThunk<
  { user: User; token: string },
  LoginRequest,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    //console.log('login credentials', credentials);
    const response = await authService.login(credentials);
    //console.log('login response', response);
    //console.log('login response structure:', JSON.stringify(response, null, 2));
    
    // Check if the response has token and user
    if (!response.token || !response.user) {
      console.error('Invalid response structure:', response);
      return rejectWithValue('Invalid response from server');
    }
    
    // Explicitly save token to localStorage
    localStorage.setItem('token', response.token);
    
    const result = { 
      user: response.user,
      token: response.token
    };
    
    //console.log('Returning success result:', result);
    return result;
  } catch (e: any) {
    console.error('Login error:', e);
    const message = e.error || 'Login failed';
    return rejectWithValue(message);
  }
});

export const register = createAsyncThunk<
  { user: User; token: string },
  RegisterRequest,
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    //console.log('register userData', userData);
    const response = await authService.register(userData);
    //console.log('register response', response);
    
    // Check if the response has token and user
    if (!response.token || !response.user) {
      console.error('Invalid register response structure:', response);
      return rejectWithValue('Invalid response from server');
    }
    
    // Explicitly save token to localStorage
    localStorage.setItem('token', response.token);
    
    return {
      user: response.user,
      token: response.token
    };
  } catch (e: any) {
    console.error('Register error:', e.error);
    const message = e.error || 'Registration failed';
    return rejectWithValue(message);
  }
});

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    return await authService.getCurrentUser();
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch user';
    return rejectWithValue(message);
  }
});

export const changePassword = createAsyncThunk<
  string,
  ChangePasswordRequest,
  { rejectValue: string }
>('auth/changePassword', async (passwords, { rejectWithValue }) => {
  try {
    const response = await authService.changePassword(passwords);
    return response.message;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to change password';
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  authService.logout();
  return null;
});

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        //console.log('login.fulfilled action:', action);
        if (!action.payload) {
          console.error('Login fulfilled but no payload received');
          state.error = 'Invalid response from server';
          state.isAuthenticated = false;
          return;
        }
        
        // Save token to localStorage
        localStorage.setItem('token', action.payload.token);
        
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        
      })
      .addCase(login.rejected, (state, action) => {
        //console.log('login.rejected action:', action);
        //console.log('login.rejected payload:', action.payload);
        //console.log('login.rejected error:', action.error);
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || action.error.message || 'Login failed';
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        //console.log('register.fulfilled action:', action);
        
        // Save token to localStorage
        localStorage.setItem('token', action.payload.token);
        
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        //console.log('Updated state after register:', state);
      })
      .addCase(register.rejected, (state, action) => {
        //console.log('register.rejected action:', action);
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || 'Failed to fetch user';
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to change password';
      });
  }
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer; 