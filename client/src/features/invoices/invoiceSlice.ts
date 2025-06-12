import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoiceService } from './services/invoiceService';
import type { 
  InvoiceState,
  Invoice,
  CreateInvoiceRequest, 
  UpdateInvoiceRequest
} from './models/invoiceModels';

// Initial state
const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
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
export const fetchInvoices = createAsyncThunk<
  { invoices: Invoice[], pagination: InvoiceState['pagination'] },
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>('invoices/fetchInvoices', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params || {};
    const response = await invoiceService.getInvoices(page, limit);
    return {
      invoices: response.data,
      pagination: response.pagination
    };
  } catch (error: any) {
    const message = error.message || 'Failed to fetch invoices';
    return rejectWithValue(message);
  }
});

export const fetchInvoiceById = createAsyncThunk<
  Invoice,
  string,
  { rejectValue: string }
>('invoices/fetchInvoiceById', async (id, { rejectWithValue }) => {
  try {
    return await invoiceService.getInvoiceById(id);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch invoice';
    return rejectWithValue(message);
  }
});

export const createInvoice = createAsyncThunk<
  Invoice,
  CreateInvoiceRequest,
  { rejectValue: string }
>('invoices/createInvoice', async (invoiceData, { rejectWithValue }) => {
  try {
    console.log('invoiceData', invoiceData);
    return await invoiceService.createInvoice(invoiceData);
  } catch (error: any) {
    const message = error.message || 'Failed to create invoice';
    return rejectWithValue(message);
  }
});

export const updateInvoice = createAsyncThunk<
  Invoice,
  { id: string; invoiceData: UpdateInvoiceRequest },
  { rejectValue: string }
>('invoices/updateInvoice', async ({ id, invoiceData }, { rejectWithValue }) => {
  try {
    return await invoiceService.updateInvoice(id, invoiceData);
  } catch (error: any) {
    const message = error.message || 'Failed to update invoice';
    return rejectWithValue(message);
  }
});

export const deleteInvoice = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('invoices/deleteInvoice', async (id, { rejectWithValue }) => {
  try {
    await invoiceService.deleteInvoice(id);
    return id;
  } catch (error: any) {
    const message = error.message || 'Failed to delete invoice';
    return rejectWithValue(message);
  }
});

export const issueInvoice = createAsyncThunk<
  Invoice,
  string,
  { rejectValue: string }
>('invoices/issueInvoice', async (id, { rejectWithValue }) => {
  try {
    return await invoiceService.issueInvoice(id);
  } catch (error: any) {
    const message = error.message || 'Failed to issue invoice';
    return rejectWithValue(message);
  }
});

export const markInvoiceAsPaid = createAsyncThunk<
  Invoice,
  string,
  { rejectValue: string }
>('invoices/markInvoiceAsPaid', async (id, { rejectWithValue }) => {
  try {
    return await invoiceService.markInvoiceAsPaid(id);
  } catch (error: any) {
    const message = error.message || 'Failed to mark invoice as paid';
    return rejectWithValue(message);
  }
});

// Invoice slice
const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch invoices';
      })
      
      // Fetch invoice by ID
      .addCase(fetchInvoiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch invoice';
      })
      
      // Create invoice
      .addCase(createInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload;
        state.invoices.unshift(action.payload);
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create invoice';
      })
      
      // Update invoice
      .addCase(updateInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload;
        const index = state.invoices.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update invoice';
      })
      
      // Delete invoice
      .addCase(deleteInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = state.invoices.filter(i => i.id !== action.payload);
        if (state.currentInvoice?.id === action.payload) {
          state.currentInvoice = null;
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete invoice';
      })
      
      // Issue invoice
      .addCase(issueInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(issueInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload;
        const index = state.invoices.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(issueInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to issue invoice';
      })
      
      // Mark invoice as paid
      .addCase(markInvoiceAsPaid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markInvoiceAsPaid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentInvoice = action.payload;
        const index = state.invoices.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(markInvoiceAsPaid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to mark invoice as paid';
      });
  }
});

export const { clearCurrentInvoice, resetError } = invoiceSlice.actions;

export default invoiceSlice.reducer; 