export interface Customer {
  id: string;
  sellerId: string;
  name: string;
  email: string;
  businessAddressId: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
}

export interface PaymentType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCart {
  id: string;
  orderId: string;
  productId?: string;
  sellerId: string;
  sku?: string;
  name?: string;
  description?: string;
  quantity: number;
  unitPrice: string; // API returns as string
  lineTotal: string; // API returns as string
  taxRate: string; // API returns as string
  taxCodeId?: string | null;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface Order {
  id: string;
  sellerId: string;
  customerId: string;
  paymentTypeId: string;
  totalAmount: string; // API returns as string
  createdAt: string;
  updatedAt: string;
  paymentType?: PaymentType;
  orderCarts: OrderCart[];
}

export interface Quote {
  id: string;
  sellerId: string;
  customerId: string;
  orderId: string;
  totalEstimate: string; // API returns as string
  expiresAt: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  order?: Order;
}

export interface QuotesResponse {
  data: Quote[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface CreateQuoteRequest {
  customerId: string;
  totalEstimate: number;
  expiresAt: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  paymentTypeId?: string;
  orderCarts: {
    productId?: string;
    name?: string;
    quantity: number;
    unitPrice: number;
    description?: string;
  }[];
}

export interface UpdateQuoteRequest extends CreateQuoteRequest {
  id: string;
}

export interface QuoteState {
  quotes: Quote[];
  currentQuote: Quote | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
} 