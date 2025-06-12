export interface TaxCode {
  id: string;
  sellerId: string;
  countryCode: string;
  region?: string;
  rate: string | number; // API returns string, but we handle both
  createdAt: string;
  updatedAt: string;
}

export interface TaxCodesResponse {
  items: TaxCode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTaxCodeRequest {
  countryCode: string;
  region?: string;
  rate: number;
}

export interface UpdateTaxCodeRequest extends CreateTaxCodeRequest {
  id: string;
}

export interface TaxState {
  taxCodes: TaxCode[];
  currentTaxCode: TaxCode | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
} 