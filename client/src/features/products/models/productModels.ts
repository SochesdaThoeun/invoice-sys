export interface Product {
  id: string;
  sellerId: string;
  sku: string;
  name: string;
  description: string;
  defaultPrice: number;
  taxCodeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description: string;
  defaultPrice: number;
  taxCodeId?: string;
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string;
}

export interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
} 