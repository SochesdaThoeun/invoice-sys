import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userProfileService } from './services/userProfileService';
import type { SettingsState } from './models/settingsModels';
import type { User } from '../auth/models/authModels';
import type { UserProfileUpdateRequest } from './models/settingsModels';

const initialState: SettingsState = {
  isLoading: false,
  error: null,
  userProfile: null
};

// Async thunks
export const getUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('settings/getUserProfile', async (_, { rejectWithValue }) => {
  try {
    return await userProfileService.getUserProfile();
  } catch (error: any) {
    const message = error.message || 'Failed to fetch user profile';
    return rejectWithValue(message);
  }
});

export const updateUserProfile = createAsyncThunk<
  User,
  UserProfileUpdateRequest,
  { rejectValue: string }
>('settings/updateUserProfile', async (profileData, { rejectWithValue }) => {
  try {
    const response = await userProfileService.updateUserProfile(profileData);
    return response;
  } catch (error: any) {
    const message = error.message || 'Failed to update user profile';
    return rejectWithValue(message);
  }
});

// Settings slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProfile = action.payload;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch user profile';
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProfile = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update user profile';
      });
  }
});

export const { resetError } = settingsSlice.actions;
export default settingsSlice.reducer; 