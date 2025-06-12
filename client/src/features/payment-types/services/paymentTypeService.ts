import { apiCall } from '../../../lib/apiUtils';
import type {
  PaymentType,
  CreatePaymentTypeRequest,
  UpdatePaymentTypeRequest
} from '../models/paymentTypeModels';

// Payment Type services
export const paymentTypeService = {
  // Get all payment types with pagination
  async getPaymentTypes(page = 1, limit = 10): Promise<PaymentType[]> {
    return apiCall<PaymentType[]>('get', `/payment-types?page=${page}&limit=${limit}`);
  },
  
  // Get active payment types
  async getActivePaymentTypes(): Promise<PaymentType[]> {
    return apiCall<PaymentType[]>('get', '/payment-types/active');
  },
  
  // Get payment type by ID
  async getPaymentTypeById(id: string): Promise<PaymentType> {
    return apiCall<PaymentType>('get', `/payment-types/${id}`);
  },
  
  // Create payment type
  async createPaymentType(paymentTypeData: CreatePaymentTypeRequest): Promise<PaymentType> {
    return apiCall<PaymentType>('post', '/payment-types', paymentTypeData);
  },
  
  // Update payment type
  async updatePaymentType(id: string, paymentTypeData: UpdatePaymentTypeRequest): Promise<PaymentType> {
    return apiCall<PaymentType>('put', `/payment-types/${id}`, paymentTypeData);
  },
  
  // Delete payment type
  async deletePaymentType(id: string): Promise<void> {
    return apiCall<void>('delete', `/payment-types/${id}`);
  }
}; 