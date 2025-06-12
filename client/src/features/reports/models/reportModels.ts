// Report models based on actual API responses

export interface FinancialSummaryReport {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalAssets: number;
  totalLiabilities: number;
}

export interface ProfitLossReport {
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface BalanceSheetReport {
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface IncomeStatementReport {
  periods: Array<{
    periodLabel: string;
    income: Record<string, number>;
    expenses: Record<string, number>;
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  }>;
  totalIncome: number;
  totalExpenses: number;
  totalNetProfit: number;
}

// Monthly stats models
export interface MonthlyStats {
  month: string;
  totalRevenue: number;
  totalCustomers: number;
  totalInvoices: number;
  totalProductsSold: number;
}

export interface MonthlyStatsResponse {
  months: MonthlyStats[];
}

export interface ReportState {
  financialSummary: FinancialSummaryReport | null;
  profitLoss: ProfitLossReport | null;
  balanceSheet: BalanceSheetReport | null;
  incomeStatement: IncomeStatementReport | null;
  monthlyStats: MonthlyStatsResponse | null;
  isLoading: boolean;
  error: string | null;
}

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  limit?: number;
  status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'all';
  minAmount?: number;
  months?: number;
} 