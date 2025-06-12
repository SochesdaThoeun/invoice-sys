import { apiCall } from '../../../lib/apiUtils';
import type {
  Product,
  ProductsResponse,
  CreateProductRequest,
  UpdateProductRequest
} from '../models/productModels';

// Product services
export const productService = {
  // Get all products with pagination
  async getProducts(page = 1, limit = 10): Promise<ProductsResponse> {
    return apiCall<ProductsResponse>('get', `/products?page=${page}&limit=${limit}`);
  },
  
  // Get product by ID
  async getProductById(id: string): Promise<Product> {
    return apiCall<Product>('get', `/products/${id}`);
  },
  
  // Get product by SKU
  async getProductBySku(sku: string): Promise<Product> {
    return apiCall<Product>('get', `/products/sku/${sku}`);
  },
  
  // Create product
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    return apiCall<Product>('post', '/products', productData);
  },
  
  // Update product
  async updateProduct(id: string, productData: UpdateProductRequest): Promise<Product> {
    return apiCall<Product>('put', `/products/${id}`, productData);
  },
  
  // Delete product
  async deleteProduct(id: string): Promise<void> {
    return apiCall<void>('delete', `/products/${id}`);
  }
}; 