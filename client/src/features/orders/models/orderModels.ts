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
  defaultPrice?: number | string;
  description?: string;
  taxCodeId?: string;
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
  productId?: string | null;
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

export interface Quote {
  id: string;
  sellerId: string;
  customerId: string;
  orderId: string;
  totalEstimate: string;
  expiresAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  sellerId: string;
  customerId: string;
  orderId: string;
  language: string;
  governmentTemplate: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  sellerId: string;
  customerId: string;
  paymentTypeId?: string | null;
  totalAmount: string; // API returns as string
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  quote?: Quote | null;
  invoice?: Invoice | null;
  orderCarts: OrderCart[];
  paymentType?: PaymentType | null;
}

export interface OrdersResponse {
  data: Order[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface CreateOrderRequest {
  customerId: string;
  totalAmount: number;
  createQuote?: boolean;
  createInvoice?: boolean;
  orderCarts: {
    productId?: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface CreateOrderFromQuoteRequest {
  quoteId: string;
  totalAmount: number;
  createInvoice?: boolean;
  orderCarts: {
    productId?: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface UpdateOrderRequest {
  totalAmount: number;
  orderCarts: {
    productId?: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface ConvertToInvoiceRequest {
  language?: string;
  governmentTemplate?: string;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
} 