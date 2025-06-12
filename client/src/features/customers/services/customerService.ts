import { apiCall } from '../../../lib/apiUtils';
import type {
  Customer,
  CustomersResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest
} from '../models/customerModels';

// Customer services
export const customerService = {
  // Get all customers with pagination
  async getCustomers(page = 1, limit = 10): Promise<CustomersResponse> {
    return apiCall<CustomersResponse>('get', `/customers?page=${page}&limit=${limit}`);
  },
  
  // Get customer by ID
  async getCustomerById(id: string): Promise<Customer> {
    return apiCall<Customer>('get', `/customers/${id}`);
  },
  
  // Get customer by email
  async getCustomerByEmail(email: string): Promise<Customer> {
    return apiCall<Customer>('get', `/customers/email/${email}`);
  },
  
  // Create customer
  async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
    return apiCall<Customer>('post', '/customers', customerData);
  },
  
  // Update customer
  async updateCustomer(id: string, customerData: UpdateCustomerRequest): Promise<Customer> {
    return apiCall<Customer>('put', `/customers/${id}`, customerData);
  },
  
  // Delete customer
  async deleteCustomer(id: string): Promise<void> {
    return apiCall<void>('delete', `/customers/${id}`);
  }
}; 