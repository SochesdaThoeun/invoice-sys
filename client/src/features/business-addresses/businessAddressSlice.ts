import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { businessAddressService } from './services/businessAddressService';
import type {
  BusinessAddressState,
  BusinessAddress,
  CreateBusinessAddressRequest,
  UpdateBusinessAddressRequest
} from './models/businessAddressModels';

// Initial state
const initialState: BusinessAddressState = {
  businessAddresses: [],
  currentBusinessAddress: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  }
};

// Async thunks
export const fetchBusinessAddresses = createAsyncThunk<
  { businessAddresses: BusinessAddress[], pagination: BusinessAddressState['pagination'] },
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>('businessAddresses/fetchBusinessAddresses', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params || {};
    const response = await businessAddressService.getBusinessAddresses(page, limit);
    //console.log('response', response);
    return {
      businessAddresses: response.items,
      pagination: {
        total: response.total,
        totalPages: response.totalPages,
        currentPage: response.page,
        limit: response.limit
      }
    };
  } catch (error: any) {
    const message = error.message || 'Failed to fetch business addresses';
    return rejectWithValue(message);
  }
});

export const fetchBusinessAddressById = createAsyncThunk<
  BusinessAddress,
  string,
  { rejectValue: string }
>('businessAddresses/fetchBusinessAddressById', async (id, { rejectWithValue }) => {
  try {
    return await businessAddressService.getBusinessAddressById(id);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch business address';
    return rejectWithValue(message);
  }
});

export const createBusinessAddress = createAsyncThunk<
  BusinessAddress,
  CreateBusinessAddressRequest,
  { rejectValue: string }
>('businessAddresses/createBusinessAddress', async (businessAddressData, { rejectWithValue }) => {
  try {
    return await businessAddressService.createBusinessAddress(businessAddressData);
  } catch (error: any) {
    const message = error.message || 'Failed to create business address';
    return rejectWithValue(message);
  }
});

export const updateBusinessAddress = createAsyncThunk<
  BusinessAddress,
  { id: string; businessAddressData: UpdateBusinessAddressRequest },
  { rejectValue: string }
>('businessAddresses/updateBusinessAddress', async ({ id, businessAddressData }, { rejectWithValue }) => {
  try {
    return await businessAddressService.updateBusinessAddress(id, businessAddressData);
  } catch (error: any) {
    const message = error.message || 'Failed to update business address';
    return rejectWithValue(message);
  }
});

export const deleteBusinessAddress = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('businessAddresses/deleteBusinessAddress', async (id, { rejectWithValue }) => {
  try {
    await businessAddressService.deleteBusinessAddress(id);
    return id;
  } catch (error: any) {
    const message = error.message || 'Failed to delete business address';
    return rejectWithValue(message);
  }
});

// Business Address slice
const businessAddressSlice = createSlice({
  name: 'businessAddresses',
  initialState,
  reducers: {
    clearCurrentBusinessAddress: (state) => {
      state.currentBusinessAddress = null;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch business addresses
      .addCase(fetchBusinessAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businessAddresses = action.payload.businessAddresses;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBusinessAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch business addresses';
      })
      
      // Fetch business address by ID
      .addCase(fetchBusinessAddressById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessAddressById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBusinessAddress = action.payload;
      })
      .addCase(fetchBusinessAddressById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch business address';
      })
      
      // Create business address
      .addCase(createBusinessAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBusinessAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBusinessAddress = action.payload;
        state.businessAddresses.unshift(action.payload);
      })
      .addCase(createBusinessAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create business address';
      })
      
      // Update business address
      .addCase(updateBusinessAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBusinessAddress = action.payload;
        const index = state.businessAddresses.findIndex(ba => ba.id === action.payload.id);
        if (index !== -1) {
          state.businessAddresses[index] = action.payload;
        }
      })
      .addCase(updateBusinessAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update business address';
      })
      
      // Delete business address
      .addCase(deleteBusinessAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBusinessAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businessAddresses = state.businessAddresses.filter(ba => ba.id !== action.payload);
        if (state.currentBusinessAddress?.id === action.payload) {
          state.currentBusinessAddress = null;
        }
      })
      .addCase(deleteBusinessAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete business address';
      });
  }
});

export const { clearCurrentBusinessAddress, resetError } = businessAddressSlice.actions;
export default businessAddressSlice.reducer; 