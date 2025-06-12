import { apiCall } from '../../../lib/apiUtils';
import type {
  Invoice,
  InvoicesResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest
} from '../models/invoiceModels';

// Invoice services
export const invoiceService = {
  // Get all invoices with pagination
  async getInvoices(page = 1, limit = 10): Promise<InvoicesResponse> {
    const response = await apiCall<Invoice[]>('get', `/invoices?page=${page}&limit=${limit}`);
    
    console.log('Invoice API Response:', response);
    console.log('Response type:', typeof response, 'Is array:', Array.isArray(response));
    
    // Handle response - API returns array directly
    if (Array.isArray(response)) {
      const result = {
        data: response,
        pagination: {
          total: response.length,
          totalPages: Math.ceil(response.length / limit),
          currentPage: page,
          limit: limit
        }
      };
      console.log('Returning invoice data:', result);
      return result;
    }
    
    // Fallback for paginated response format
    const paginatedResponse = response as any;
    return {
      data: paginatedResponse.items || paginatedResponse.data || [],
      pagination: {
        total: paginatedResponse.total || 0,
        totalPages: paginatedResponse.totalPages || 1,
        currentPage: paginatedResponse.page || page,
        limit: paginatedResponse.limit || limit
      }
    };
  },
  
  // Get invoice by ID
  async getInvoiceById(id: string): Promise<Invoice> {
    return apiCall<Invoice>('get', `/invoices/${id}`);
  },
  
  // Create invoice
  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<Invoice> {
    return apiCall<Invoice>('post', '/invoices', invoiceData);
  },
  
  // Update invoice
  async updateInvoice(id: string, invoiceData: UpdateInvoiceRequest): Promise<Invoice> {
    return apiCall<Invoice>('put', `/invoices/${id}`, invoiceData);
  },
  
  // Delete invoice
  async deleteInvoice(id: string): Promise<void> {
    return apiCall<void>('delete', `/invoices/${id}`);
  },
  
  // Issue invoice
  async issueInvoice(id: string): Promise<Invoice> {
    return apiCall<Invoice>('post', `/invoices/${id}/issue`, {});
  },
  
  // Mark invoice as paid
  async markInvoiceAsPaid(id: string): Promise<Invoice> {
    return apiCall<Invoice>('post', `/invoices/${id}/paid`, {});
  }
}; 