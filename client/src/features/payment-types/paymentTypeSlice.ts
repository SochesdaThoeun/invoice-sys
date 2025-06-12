import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentTypeService } from './services/paymentTypeService';
import type {
  PaymentTypeState,
  PaymentType,
  CreatePaymentTypeRequest,
  UpdatePaymentTypeRequest
} from './models/paymentTypeModels';

// Initial state
const initialState: PaymentTypeState = {
  paymentTypes: [],
  currentPaymentType: null,
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
export const fetchPaymentTypes = createAsyncThunk<
  PaymentType[],
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>('paymentTypes/fetchPaymentTypes', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params || {};
    const response = await paymentTypeService.getPaymentTypes(page, limit);
    //console.log('response', response);
    // API returns direct array, not paginated response
    return response;
  } catch (error: any) {
    const message = error.message || 'Failed to fetch payment types';
    return rejectWithValue(message);
  }
});

export const fetchActivePaymentTypes = createAsyncThunk<
  PaymentType[],
  void,
  { rejectValue: string }
>('paymentTypes/fetchActivePaymentTypes', async (_, { rejectWithValue }) => {
  try {
    return await paymentTypeService.getActivePaymentTypes();
  } catch (error: any) {
    const message = error.message || 'Failed to fetch active payment types';
    return rejectWithValue(message);
  }
});

export const fetchPaymentTypeById = createAsyncThunk<
  PaymentType,
  string,
  { rejectValue: string }
>('paymentTypes/fetchPaymentTypeById', async (id, { rejectWithValue }) => {
  try {
    return await paymentTypeService.getPaymentTypeById(id);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch payment type';
    return rejectWithValue(message);
  }
});

export const createPaymentType = createAsyncThunk<
  PaymentType,
  CreatePaymentTypeRequest,
  { rejectValue: string }
>('paymentTypes/createPaymentType', async (paymentTypeData, { rejectWithValue }) => {
  try {
    return await paymentTypeService.createPaymentType(paymentTypeData);
  } catch (error: any) {
    const message = error.message || 'Failed to create payment type';
    return rejectWithValue(message);
  }
});

export const updatePaymentType = createAsyncThunk<
  PaymentType,
  { id: string; paymentTypeData: UpdatePaymentTypeRequest },
  { rejectValue: string }
>('paymentTypes/updatePaymentType', async ({ id, paymentTypeData }, { rejectWithValue }) => {
  try {
    return await paymentTypeService.updatePaymentType(id, paymentTypeData);
  } catch (error: any) {
    const message = error.message || 'Failed to update payment type';
    return rejectWithValue(message);
  }
});

export const deletePaymentType = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('paymentTypes/deletePaymentType', async (id, { rejectWithValue }) => {
  try {
    await paymentTypeService.deletePaymentType(id);
    return id;
  } catch (error: any) {
    const message = error.message || 'Failed to delete payment type';
    return rejectWithValue(message);
  }
});

// Payment Type slice
const paymentTypeSlice = createSlice({
  name: 'paymentTypes',
  initialState,
  reducers: {
    clearCurrentPaymentType: (state) => {
      state.currentPaymentType = null;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch payment types
      .addCase(fetchPaymentTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentTypes = action.payload;
        // Update pagination to reflect the current data
        state.pagination = {
          total: action.payload.length,
          totalPages: 1,
          currentPage: 1,
          limit: action.payload.length
        };
      })
      .addCase(fetchPaymentTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch payment types';
      })
      
      // Fetch active payment types
      .addCase(fetchActivePaymentTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivePaymentTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentTypes = action.payload;
      })
      .addCase(fetchActivePaymentTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch active payment types';
      })
      
      // Fetch payment type by ID
      .addCase(fetchPaymentTypeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentTypeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPaymentType = action.payload;
      })
      .addCase(fetchPaymentTypeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch payment type';
      })
      
      // Create payment type
      .addCase(createPaymentType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPaymentType = action.payload;
        // Ensure paymentTypes array exists before adding to it
        if (!state.paymentTypes) {
          state.paymentTypes = [];
        }
        state.paymentTypes.unshift(action.payload);
      })
      .addCase(createPaymentType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create payment type';
      })
      
      // Update payment type
      .addCase(updatePaymentType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPaymentType = action.payload;
        // Ensure paymentTypes array exists before updating
        if (!state.paymentTypes) {
          state.paymentTypes = [];
        }
        const index = state.paymentTypes.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.paymentTypes[index] = action.payload;
        }
      })
      .addCase(updatePaymentType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update payment type';
      })
      
      // Delete payment type
      .addCase(deletePaymentType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePaymentType.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure paymentTypes array exists before filtering
        if (!state.paymentTypes) {
          state.paymentTypes = [];
        }
        state.paymentTypes = state.paymentTypes.filter(p => p.id !== action.payload);
        if (state.currentPaymentType?.id === action.payload) {
          state.currentPaymentType = null;
        }
      })
      .addCase(deletePaymentType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete payment type';
      });
  }
});

export const { clearCurrentPaymentType, resetError } = paymentTypeSlice.actions;
export default paymentTypeSlice.reducer; 