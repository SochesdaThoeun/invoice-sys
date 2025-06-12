import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from './services/productService';
import type {
  ProductState,
  Product,
  CreateProductRequest,
  UpdateProductRequest
} from './models/productModels';

// Initial state
const initialState: ProductState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  }
};

// Async thunks
export const fetchProducts = createAsyncThunk<
  { products: Product[], pagination: ProductState['pagination'] },
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>('products/fetchProducts', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params || {};
    const response = await productService.getProducts(page, limit);
    //console.log('products response', response);
    return {
      products: response.items,
      pagination: {
        total: response.total,
        totalPages: response.totalPages,
        currentPage: response.page,
        limit: response.limit
      }
    };
  } catch (error: any) {
    const message = error.message || 'Failed to fetch products';
    return rejectWithValue(message);
  }
});

export const fetchProductById = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>('products/fetchProductById', async (id, { rejectWithValue }) => {
  try {
    return await productService.getProductById(id);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch product';
    return rejectWithValue(message);
  }
});

export const fetchProductBySku = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>('products/fetchProductBySku', async (sku, { rejectWithValue }) => {
  try {
    return await productService.getProductBySku(sku);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch product';
    return rejectWithValue(message);
  }
});

export const createProduct = createAsyncThunk<
  Product,
  CreateProductRequest,
  { rejectValue: string }
>('products/createProduct', async (productData, { rejectWithValue }) => {
  try {
    return await productService.createProduct(productData);
  } catch (error: any) {
    const message = error.message || 'Failed to create product';
    return rejectWithValue(message);
  }
});

export const updateProduct = createAsyncThunk<
  Product,
  { id: string; productData: UpdateProductRequest },
  { rejectValue: string }
>('products/updateProduct', async ({ id, productData }, { rejectWithValue }) => {
  try {
    return await productService.updateProduct(id, productData);
  } catch (error: any) {
    const message = error.message || 'Failed to update product';
    return rejectWithValue(message);
  }
});

export const deleteProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('products/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await productService.deleteProduct(id);
    return id;
  } catch (error: any) {
    const message = error.message || 'Failed to delete product';
    return rejectWithValue(message);
  }
});

// Product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch product';
      })
      
      // Fetch product by SKU
      .addCase(fetchProductBySku.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductBySku.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductBySku.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch product';
      })
      
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create product';
      })
      
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update product';
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(p => p.id !== action.payload);
        if (state.currentProduct?.id === action.payload) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete product';
      });
  }
});

export const { clearCurrentProduct, resetError } = productSlice.actions;
export default productSlice.reducer; 