export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessRegistrationNumber?: string;
  businessName?: string;
  role: 'ADMIN' | 'SELLER';
  locale: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  businessRegistrationNumber?: string;
  businessName?: string;
  password: string;
  role?: 'ADMIN' | 'SELLER';
  locale?: string;
  currency?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
} 