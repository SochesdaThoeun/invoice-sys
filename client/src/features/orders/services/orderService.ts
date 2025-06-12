import { apiCall } from '../../../lib/apiUtils';
import type {
  Order,
  OrdersResponse,
  CreateOrderRequest,
  CreateOrderFromQuoteRequest,
  UpdateOrderRequest,
  ConvertToInvoiceRequest
} from '../models/orderModels';

// Order services
export const orderService = {
  // Get all orders with pagination
  async getOrders(page = 1, limit = 10): Promise<OrdersResponse> {
    const response = await apiCall<Order[] | any>('get', `/orders?page=${page}&limit=${limit}`);
    
    // If response is an array (direct list), transform to pagination format
    if (Array.isArray(response)) {
      return {
        data: response,
        pagination: {
          total: response.length,
          totalPages: 1,
          currentPage: 1,
          limit: response.length
        }
      };
    }
    
    // If response has pagination structure
    return {
      data: response.items || response.data || [],
      pagination: {
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: response.page || response.currentPage || 1,
        limit: response.limit || 10
      }
    };
  },
  
  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    return apiCall<Order>('get', `/orders/${id}`);
  },
  
  // Create order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    return apiCall<Order>('post', '/orders', orderData);
  },
  
  // Create order from quote
  async createOrderFromQuote(orderData: CreateOrderFromQuoteRequest): Promise<Order> {
    return apiCall<Order>('post', '/orders/from-quote', orderData);
  },
  
  // Update order
  async updateOrder(id: string, orderData: UpdateOrderRequest): Promise<Order> {
    return apiCall<Order>('put', `/orders/${id}`, orderData);
  },
  
  // Delete order
  async deleteOrder(id: string): Promise<void> {
    return apiCall<void>('delete', `/orders/${id}`);
  },
  
  // Convert order to invoice
  async convertToInvoice(id: string, data: ConvertToInvoiceRequest): Promise<any> {
    return apiCall<any>('post', `/orders/${id}/convert-to-invoice`, data);
  }
}; 