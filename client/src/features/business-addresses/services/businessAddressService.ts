import { apiCall } from '../../../lib/apiUtils';
import type {
  BusinessAddress,
  BusinessAddressesResponse,
  CreateBusinessAddressRequest,
  UpdateBusinessAddressRequest
} from '../models/businessAddressModels';

// Business Address services
export const businessAddressService = {
  // Get all business addresses with pagination
  async getBusinessAddresses(page = 1, limit = 10): Promise<BusinessAddressesResponse> {
    const businessAddresses = await apiCall<BusinessAddress[]>('get', `/business-addresses`);
    // Since the API returns an array directly, we need to simulate pagination on the client side
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = businessAddresses.slice(startIndex, endIndex);
    
    return {
      items: paginatedItems,
      total: businessAddresses.length,
      page,
      limit,
      totalPages: Math.ceil(businessAddresses.length / limit)
    };
  },
  
  // Get business address by ID
  async getBusinessAddressById(id: string): Promise<BusinessAddress> {
    return apiCall<BusinessAddress>('get', `/business-addresses/${id}`);
  },
  
  // Create business address
  async createBusinessAddress(businessAddressData: CreateBusinessAddressRequest): Promise<BusinessAddress> {
    return apiCall<BusinessAddress>('post', '/business-addresses', businessAddressData);
  },
  
  // Update business address
  async updateBusinessAddress(id: string, businessAddressData: UpdateBusinessAddressRequest): Promise<BusinessAddress> {
    return apiCall<BusinessAddress>('patch', `/business-addresses/${id}`, businessAddressData);
  },
  
  // Delete business address
  async deleteBusinessAddress(id: string): Promise<void> {
    return apiCall<void>('delete', `/business-addresses/${id}`);
  }
}; 