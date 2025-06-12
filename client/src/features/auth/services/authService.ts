import { apiCall } from '../../../lib/apiUtils';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    ChangePasswordRequest,
    User
} from '../models/authModels';

// Auth services
export const authService = {
  // Login user
  async login(userData: LoginRequest): Promise<LoginResponse> {
    //console.log('login userData', userData);
    try {
      const response = await apiCall<LoginResponse>('post', '/auth/login', userData);
      //console.log('API raw response:', response);
      
      if (response.token && response.user) {
        //console.log('Login successful, saving token');
        localStorage.setItem('token', response.token);
      } else {
        //console.log('Login response missing token or user:', response);
      }
      return response;
    } catch (error) {
      console.error('Error in login service:', error);
      throw error;
    }
  },
  
  // Register user
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiCall<RegisterResponse>('post', '/auth/register', userData);
    if (response.token && response.user) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },
  
  // Get current user
  async getCurrentUser(): Promise<User> {
    return apiCall<User>('get', '/auth/me');
  },
  
  // Change password
  async changePassword(passwords: ChangePasswordRequest): Promise<{ success: boolean, message: string }> {
    return apiCall<{ success: boolean, message: string }>('post', '/auth/change-password', passwords);
  },
  
  // Logout
  logout(): void {
    localStorage.removeItem('token');
  },
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return localStorage.getItem('token') !== null;
  }
};
