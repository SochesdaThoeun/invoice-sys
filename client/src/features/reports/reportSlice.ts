import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from './services/reportService';
import type {
  ReportState,
  FinancialSummaryReport,
  ProfitLossReport,
  BalanceSheetReport,
  IncomeStatementReport,
  MonthlyStatsResponse,
  ReportParams
} from './models/reportModels';

// Initial state
const initialState: ReportState = {
  financialSummary: null,
  profitLoss: null,
  balanceSheet: null,
  incomeStatement: null,
  monthlyStats: null,
  isLoading: false,
  error: null
};

// Async thunks
export const fetchFinancialSummaryReport = createAsyncThunk<
  FinancialSummaryReport,
  ReportParams | undefined,
  { rejectValue: string }
>('reports/fetchFinancialSummaryReport', async (params, { rejectWithValue }) => {
  try {
    return await reportService.getFinancialSummaryReport(params);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch financial summary report';
    return rejectWithValue(message);
  }
});

export const fetchProfitLossReport = createAsyncThunk<
  ProfitLossReport,
  ReportParams | undefined,
  { rejectValue: string }
>('reports/fetchProfitLossReport', async (params, { rejectWithValue }) => {
  try {
    return await reportService.getProfitLossReport(params);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch profit loss report';
    return rejectWithValue(message);
  }
});

export const fetchBalanceSheetReport = createAsyncThunk<
  BalanceSheetReport,
  ReportParams | undefined,
  { rejectValue: string }
>('reports/fetchBalanceSheetReport', async (params, { rejectWithValue }) => {
  try {
    return await reportService.getBalanceSheetReport(params);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch balance sheet report';
    return rejectWithValue(message);
  }
});

export const fetchIncomeStatementReport = createAsyncThunk<
  IncomeStatementReport,
  ReportParams | undefined,
  { rejectValue: string }
>('reports/fetchIncomeStatementReport', async (params, { rejectWithValue }) => {
  try {
    return await reportService.getIncomeStatementReport(params);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch income statement report';
    return rejectWithValue(message);
  }
});

export const fetchMonthlyStats = createAsyncThunk<
  MonthlyStatsResponse,
  void,
  { rejectValue: string }
>('reports/fetchMonthlyStats', async (_, { rejectWithValue }) => {
  try {
    return await reportService.getMonthlyStats();
  } catch (error: any) {
    const message = error.message || 'Failed to fetch monthly stats';
    return rejectWithValue(message);
  }
});

// Reports slice
const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    clearReports: (state) => {
      state.financialSummary = null;
      state.profitLoss = null;
      state.balanceSheet = null;
      state.incomeStatement = null;
      state.monthlyStats = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Financial Summary Report
      .addCase(fetchFinancialSummaryReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFinancialSummaryReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.financialSummary = action.payload;
      })
      .addCase(fetchFinancialSummaryReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch financial summary report';
      })
      
      // Profit Loss Report
      .addCase(fetchProfitLossReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfitLossReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profitLoss = action.payload;
      })
      .addCase(fetchProfitLossReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch profit loss report';
      })
      
      // Balance Sheet Report
      .addCase(fetchBalanceSheetReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBalanceSheetReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balanceSheet = action.payload;
      })
      .addCase(fetchBalanceSheetReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch balance sheet report';
      })
      
      // Income Statement Report
      .addCase(fetchIncomeStatementReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIncomeStatementReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.incomeStatement = action.payload;
      })
      .addCase(fetchIncomeStatementReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch income statement report';
      })
      
      // Monthly Stats
      .addCase(fetchMonthlyStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyStats = action.payload;
      })
      .addCase(fetchMonthlyStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch monthly stats';
      });
  }
});

export const { resetError, clearReports } = reportSlice.actions;

export default reportSlice.reducer; 