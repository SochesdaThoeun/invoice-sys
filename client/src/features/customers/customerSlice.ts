import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerService } from './services/customerService';
import type {
  CustomerState,
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest
} from './models/customerModels';

// Initial state
const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
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
export const fetchCustomers = createAsyncThunk<
  { customers: Customer[], pagination: CustomerState['pagination'] },
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>('customers/fetchCustomers', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params || {};
    const response = await customerService.getCustomers(page, limit);
    console.log('response', response);
    return {
      customers: response.items,
      pagination: {
        total: response.total,
        totalPages: response.totalPages,
        currentPage: response.page,
        limit: response.limit
      }
    };
  } catch (error: any) {
    const message = error.message || 'Failed to fetch customers';
    return rejectWithValue(message);
  }
});

export const fetchCustomerById = createAsyncThunk<
  Customer,
  string,
  { rejectValue: string }
>('customers/fetchCustomerById', async (id, { rejectWithValue }) => {
  try {
    return await customerService.getCustomerById(id);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch customer';
    return rejectWithValue(message);
  }
});

export const fetchCustomerByEmail = createAsyncThunk<
  Customer,
  string,
  { rejectValue: string }
>('customers/fetchCustomerByEmail', async (email, { rejectWithValue }) => {
  try {
    return await customerService.getCustomerByEmail(email);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch customer';
    return rejectWithValue(message);
  }
});

export const createCustomer = createAsyncThunk<
  Customer,
  CreateCustomerRequest,
  { rejectValue: string }
>('customers/createCustomer', async (customerData, { rejectWithValue }) => {
  try {
    return await customerService.createCustomer(customerData);
  } catch (error: any) {
    const message = error.message || 'Failed to create customer';
    return rejectWithValue(message);
  }
});

export const updateCustomer = createAsyncThunk<
  Customer,
  { id: string; customerData: UpdateCustomerRequest },
  { rejectValue: string }
>('customers/updateCustomer', async ({ id, customerData }, { rejectWithValue }) => {
  try {
    return await customerService.updateCustomer(id, customerData);
  } catch (error: any) {
    const message = error.message || 'Failed to update customer';
    return rejectWithValue(message);
  }
});

export const deleteCustomer = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('customers/deleteCustomer', async (id, { rejectWithValue }) => {
  try {
    await customerService.deleteCustomer(id);
    return id;
  } catch (error: any) {
    const message = error.message || 'Failed to delete customer';
    return rejectWithValue(message);
  }
});

// Customer slice
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.customers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch customers';
      })
      
      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch customer';
      })
      
      // Fetch customer by email
      .addCase(fetchCustomerByEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerByEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerByEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch customer';
      })
      
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCustomer = action.payload;
        state.customers.unshift(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create customer';
      })
      
      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCustomer = action.payload;
        const index = state.customers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update customer';
      })
      
      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = state.customers.filter(c => c.id !== action.payload);
        if (state.currentCustomer?.id === action.payload) {
          state.currentCustomer = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete customer';
      });
  }
});

export const { clearCurrentCustomer, resetError } = customerSlice.actions;

export default customerSlice.reducer; 