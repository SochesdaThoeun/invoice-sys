import { apiCall } from '../../../lib/apiUtils';
import type {
  TaxCode,
  TaxCodesResponse,
  CreateTaxCodeRequest,
  UpdateTaxCodeRequest
} from '../models/taxModels';

// Tax services
export const taxService = {
  // Get all tax codes with pagination
  async getTaxCodes(page = 1, limit = 10): Promise<TaxCodesResponse> {
    return apiCall<TaxCodesResponse>('get', `/tax-codes?page=${page}&limit=${limit}`);
  },
  
  // Get tax code by ID
  async getTaxCodeById(id: string): Promise<TaxCode> {
    return apiCall<TaxCode>('get', `/tax-codes/${id}`);
  },
  
  // Get tax code by country and region
  async getTaxCodeByCountryAndRegion(countryCode: string, region?: string): Promise<TaxCode> {
    const url = region 
      ? `/tax-codes/country/${countryCode}/region/${region}`
      : `/tax-codes/country/${countryCode}`;
    return apiCall<TaxCode>('get', url);
  },
  
  // Create tax code
  async createTaxCode(taxCodeData: CreateTaxCodeRequest): Promise<TaxCode> {
    return apiCall<TaxCode>('post', '/tax-codes', taxCodeData);
  },
  
  // Update tax code
  async updateTaxCode(id: string, taxCodeData: UpdateTaxCodeRequest): Promise<TaxCode> {
    return apiCall<TaxCode>('put', `/tax-codes/${id}`, taxCodeData);
  },
  
  // Delete tax code
  async deleteTaxCode(id: string): Promise<void> {
    return apiCall<void>('delete', `/tax-codes/${id}`);
  }
}; 