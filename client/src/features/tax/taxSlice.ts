import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taxService } from './services/taxService';
import type {
  TaxState,
  TaxCode,
  CreateTaxCodeRequest,
  UpdateTaxCodeRequest
} from './models/taxModels';

// Initial state
const initialState: TaxState = {
  taxCodes: [],
  currentTaxCode: null,
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
export const fetchTaxCodes = createAsyncThunk<
  { taxCodes: TaxCode[], pagination: TaxState['pagination'] },
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>('tax/fetchTaxCodes', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params || {};
    const response = await taxService.getTaxCodes(page, limit);
    //console.log('tax response', response);
    return {
      taxCodes: response.items,
      pagination: {
        total: response.total,
        totalPages: response.totalPages,
        currentPage: response.page,
        limit: response.limit
      }
    };
  } catch (error: any) {
    const message = error.message || 'Failed to fetch tax codes';
    return rejectWithValue(message);
  }
});

export const fetchTaxCodeById = createAsyncThunk<
  TaxCode,
  string,
  { rejectValue: string }
>('tax/fetchTaxCodeById', async (id, { rejectWithValue }) => {
  try {
    return await taxService.getTaxCodeById(id);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch tax code';
    return rejectWithValue(message);
  }
});

export const fetchTaxCodeByCountryAndRegion = createAsyncThunk<
  TaxCode,
  { countryCode: string; region?: string },
  { rejectValue: string }
>('tax/fetchTaxCodeByCountryAndRegion', async ({ countryCode, region }, { rejectWithValue }) => {
  try {
    return await taxService.getTaxCodeByCountryAndRegion(countryCode, region);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch tax code';
    return rejectWithValue(message);
  }
});

export const createTaxCode = createAsyncThunk<
  TaxCode,
  CreateTaxCodeRequest,
  { rejectValue: string }
>('tax/createTaxCode', async (taxCodeData, { rejectWithValue }) => {
  try {
    return await taxService.createTaxCode(taxCodeData);
  } catch (error: any) {
    const message = error.message || 'Failed to create tax code';
    return rejectWithValue(message);
  }
});

export const updateTaxCode = createAsyncThunk<
  TaxCode,
  { id: string; taxCodeData: UpdateTaxCodeRequest },
  { rejectValue: string }
>('tax/updateTaxCode', async ({ id, taxCodeData }, { rejectWithValue }) => {
  try {
    return await taxService.updateTaxCode(id, taxCodeData);
  } catch (error: any) {
    const message = error.message || 'Failed to update tax code';
    return rejectWithValue(message);
  }
});

export const deleteTaxCode = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('tax/deleteTaxCode', async (id, { rejectWithValue }) => {
  try {
    await taxService.deleteTaxCode(id);
    return id;
  } catch (error: any) {
    const message = error.message || 'Failed to delete tax code';
    return rejectWithValue(message);
  }
});

// Tax slice
const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {
    clearCurrentTaxCode: (state) => {
      state.currentTaxCode = null;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tax codes
      .addCase(fetchTaxCodes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaxCodes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taxCodes = action.payload.taxCodes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTaxCodes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch tax codes';
      })
      
      // Fetch tax code by ID
      .addCase(fetchTaxCodeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaxCodeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTaxCode = action.payload;
      })
      .addCase(fetchTaxCodeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch tax code';
      })
      
      // Fetch tax code by country and region
      .addCase(fetchTaxCodeByCountryAndRegion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaxCodeByCountryAndRegion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTaxCode = action.payload;
      })
      .addCase(fetchTaxCodeByCountryAndRegion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch tax code';
      })
      
      // Create tax code
      .addCase(createTaxCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTaxCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTaxCode = action.payload;
        state.taxCodes.unshift(action.payload);
      })
      .addCase(createTaxCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create tax code';
      })
      
      // Update tax code
      .addCase(updateTaxCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTaxCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTaxCode = action.payload;
        const index = state.taxCodes.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.taxCodes[index] = action.payload;
        }
      })
      .addCase(updateTaxCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update tax code';
      })
      
      // Delete tax code
      .addCase(deleteTaxCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTaxCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taxCodes = state.taxCodes.filter(t => t.id !== action.payload);
        if (state.currentTaxCode?.id === action.payload) {
          state.currentTaxCode = null;
        }
      })
      .addCase(deleteTaxCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete tax code';
      });
  },
});

export const { clearCurrentTaxCode, resetError } = taxSlice.actions;
export default taxSlice.reducer; 