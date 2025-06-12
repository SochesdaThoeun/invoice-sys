import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quoteService } from './services/quoteService';
import type { 
  QuoteState,
  Quote,
  CreateQuoteRequest, 
  UpdateQuoteRequest
} from './models/quoteModels';

// Initial state
const initialState: QuoteState = {
  quotes: [],
  currentQuote: null,
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
export const fetchQuotes = createAsyncThunk<
  { quotes: Quote[], pagination: QuoteState['pagination'] },
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>('quotes/fetchQuotes', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params || {};
    const response = await quoteService.getQuotes(page, limit);
    return {
      quotes: response.data,
      pagination: response.pagination
    };
  } catch (error: any) {
    const message = error.message || 'Failed to fetch quotes';
    return rejectWithValue(message);
  }
});

export const fetchQuoteById = createAsyncThunk<
  Quote,
  string,
  { rejectValue: string }
>('quotes/fetchQuoteById', async (id, { rejectWithValue }) => {
  try {
    return await quoteService.getQuoteById(id);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch quote';
    return rejectWithValue(message);
  }
});

export const createQuote = createAsyncThunk<
  Quote,
  CreateQuoteRequest,
  { rejectValue: string }
>('quotes/createQuote', async (quoteData, { rejectWithValue }) => {
  try {
    //console.log('quoteData', quoteData);
    return await quoteService.createQuote(quoteData);
  } catch (error: any) {
    const message = error.message || 'Failed to create quote';
    return rejectWithValue(message);
  }
});

export const updateQuote = createAsyncThunk<
  Quote,
  { id: string; quoteData: UpdateQuoteRequest },
  { rejectValue: string }
>('quotes/updateQuote', async ({ id, quoteData }, { rejectWithValue }) => {
  try {
    return await quoteService.updateQuote(id, quoteData);
  } catch (error: any) {
    const message = error.message || 'Failed to update quote';
    return rejectWithValue(message);
  }
});

export const deleteQuote = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('quotes/deleteQuote', async (id, { rejectWithValue }) => {
  try {
    await quoteService.deleteQuote(id);
    return id;
  } catch (error: any) {
    const message = error.message || 'Failed to delete quote';
    return rejectWithValue(message);
  }
});

// Quote slice
const quoteSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    clearCurrentQuote: (state) => {
      state.currentQuote = null;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch quotes
      .addCase(fetchQuotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotes = action.payload.quotes;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch quotes';
      })
      
      // Fetch quote by ID
      .addCase(fetchQuoteById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuoteById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuote = action.payload;
      })
      .addCase(fetchQuoteById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch quote';
      })
      
      // Create quote
      .addCase(createQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuote = action.payload;
        state.quotes.unshift(action.payload);
      })
      .addCase(createQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create quote';
      })
      
      // Update quote
      .addCase(updateQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuote = action.payload;
        const index = state.quotes.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.quotes[index] = action.payload;
        }
      })
      .addCase(updateQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update quote';
      })
      
      // Delete quote
      .addCase(deleteQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotes = state.quotes.filter(q => q.id !== action.payload);
        if (state.currentQuote?.id === action.payload) {
          state.currentQuote = null;
        }
      })
      .addCase(deleteQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete quote';
      });
  }
});

export const { clearCurrentQuote, resetError } = quoteSlice.actions;

export default quoteSlice.reducer; 