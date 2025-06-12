import { apiCall } from '../../../lib/apiUtils';
import type {
  FinancialSummaryReport,
  ProfitLossReport,
  BalanceSheetReport,
  IncomeStatementReport,
  MonthlyStatsResponse,
  ReportParams
} from '../models/reportModels';

export const reportService = {
  async getFinancialSummaryReport(params?: ReportParams): Promise<FinancialSummaryReport> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.period) queryParams.append('period', params.period);
    
    const url = `/ledger/reports/summary${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiCall<FinancialSummaryReport>('get', url);
  },

  async getProfitLossReport(params?: ReportParams): Promise<ProfitLossReport> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.period) queryParams.append('period', params.period);
    
    const url = `/ledger/reports/profit-loss${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiCall<ProfitLossReport>('get', url);
  },

  async getBalanceSheetReport(params?: ReportParams): Promise<BalanceSheetReport> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `/ledger/reports/balance-sheet${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiCall<BalanceSheetReport>('get', url);
  },

  async getIncomeStatementReport(params?: ReportParams): Promise<IncomeStatementReport> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.period) queryParams.append('period', params.period);
    
    const url = `/ledger/reports/income-statement${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiCall<IncomeStatementReport>('get', url);
  },

  async getMonthlyStats(): Promise<MonthlyStatsResponse> {
    const url = `/stats/monthly`;
    return apiCall<MonthlyStatsResponse>('get', url);
  }
}; 