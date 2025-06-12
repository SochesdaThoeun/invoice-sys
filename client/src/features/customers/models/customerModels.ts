export interface Address {
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

export interface Customer {
  id: string;
  sellerId: string;
  name: string;
  email?: string;
  phone?: string;
  businessRegistrationNumber?: string;
  businessName?: string;
  businessAddress?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  items: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BusinessAddressRequest {
  country?: string;
  state?: string;
  street?: string;
  houseNumber?: string;
  address?: string;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  businessRegistrationNumber?: string;
  businessName?: string;
  businessAddress?: BusinessAddressRequest;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  id: string;
}

export interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
} 