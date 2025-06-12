import type { User } from '../../auth/models/authModels';

export interface UserProfileUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  businessRegistrationNumber?: string;
  businessName?: string;
  locale?: string;
  currency?: string;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface SettingsState {
  isLoading: boolean;
  error: string | null;
  userProfile: User | null;
} 