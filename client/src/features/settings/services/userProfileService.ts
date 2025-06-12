import { apiCall } from '../../../lib/apiUtils';
import type { User } from '../../auth/models/authModels';
import type { UserProfileUpdateRequest } from '../models/settingsModels';

export const userProfileService = {
  // Get user profile
  async getUserProfile(): Promise<User> {
    return apiCall<User>('get', '/users/profile');
  },
  
  // Update user profile
  async updateUserProfile(profileData: UserProfileUpdateRequest): Promise<User> {
    return apiCall<User>('put', '/users/profile', profileData);
  }
}; 