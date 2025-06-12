export interface BusinessAddress {
  id: string;
  sellerId: string;
  businessId: string;
  country: string;
  state: string;
  street: string;
  houseNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessAddressesResponse {
  items: BusinessAddress[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateBusinessAddressRequest {
  country: string;
  state: string;
  street: string;
  houseNumber: string;
  address: string;
}

export interface UpdateBusinessAddressRequest {
  country?: string;
  state?: string;
  street?: string;
  houseNumber?: string;
  address?: string;
}

export interface BusinessAddressState {
  businessAddresses: BusinessAddress[];
  currentBusinessAddress: BusinessAddress | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
} 