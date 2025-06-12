export interface PaymentType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTypesResponse {
  items: PaymentType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePaymentTypeRequest {
  name: string;
  description: string;
  isActive: boolean;
}

export interface UpdatePaymentTypeRequest extends CreatePaymentTypeRequest {
  id: string;
}

export interface PaymentTypeState {
  paymentTypes: PaymentType[];
  currentPaymentType: PaymentType | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
} 