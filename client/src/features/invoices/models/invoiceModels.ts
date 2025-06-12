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
  name: string;
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

export interface Invoice {
  id: string;
  sellerId: string;
  customerId: string;
  orderId: string;
  totalAmount: string; // API returns as string
  language: string;
  governmentTemplate: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID';
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  order?: Order;
}

export interface InvoicesResponse {
  data: Invoice[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface CreateInvoiceRequest {
  customerId: string;
  orderId?: string;
  language?: string;
  governmentTemplate?: string;
  paymentTypeId?: string;
  orderCarts?: {
    productId?: string;
    name?: string;
    quantity: number;
    unitPrice: number;
    description?: string;
  }[];
}

export interface UpdateInvoiceRequest {
  language?: string;
  governmentTemplate?: string;
  status?: 'DRAFT' | 'ISSUED' | 'PAID';
  orderCarts?: {
    productId?: string;
    name?: string;
    quantity: number;
    unitPrice: number;
    description?: string;
  }[];
}

export interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
} 