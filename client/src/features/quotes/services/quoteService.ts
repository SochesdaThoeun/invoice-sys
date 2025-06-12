import { apiCall } from '../../../lib/apiUtils';
import type {
  Quote,
  QuotesResponse,
  CreateQuoteRequest,
  UpdateQuoteRequest
} from '../models/quoteModels';

// Quote services
export const quoteService = {
  // Get all quotes with pagination
  async getQuotes(page = 1, limit = 10): Promise<QuotesResponse> {
    const response = await apiCall<{
      items: Quote[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('get', `/quotes?page=${page}&limit=${limit}`);
    
    // Transform the response to match our expected format
    return {
      data: response.items,
      pagination: {
        total: response.total,
        totalPages: response.totalPages,
        currentPage: response.page,
        limit: response.limit
      }
    };
  },
  
  // Get quote by ID
  async getQuoteById(id: string): Promise<Quote> {
    return apiCall<Quote>('get', `/quotes/${id}`);
  },
  
  // Create quote
  async createQuote(quoteData: CreateQuoteRequest): Promise<Quote> {
    return apiCall<Quote>('post', '/quotes', quoteData);
  },
  
  // Update quote
  async updateQuote(id: string, quoteData: UpdateQuoteRequest): Promise<Quote> {
    return apiCall<Quote>('put', `/quotes/${id}`, quoteData);
  },
  
  // Delete quote
  async deleteQuote(id: string): Promise<void> {
    return apiCall<void>('delete', `/quotes/${id}`);
  }
}; 