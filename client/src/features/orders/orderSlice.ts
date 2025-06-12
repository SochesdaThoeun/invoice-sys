import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from './services/orderService';
import type { 
  OrderState,
  Order,
  CreateOrderRequest,
  CreateOrderFromQuoteRequest,
  UpdateOrderRequest,
  ConvertToInvoiceRequest
} from './models/orderModels';

// Initial state
const initialState: OrderState = {
  orders: [],
  currentOrder: null,
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
export const fetchOrders = createAsyncThunk<
  { orders: Order[], pagination: OrderState['pagination'] },
  { page?: number; limit?: number } | undefined,
  { rejectValue: string }
>('orders/fetchOrders', async (params, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params || {};
    const response = await orderService.getOrders(page, limit);
    return {
      orders: response.data,
      pagination: response.pagination
    };
  } catch (error: any) {
    const message = error.message || 'Failed to fetch orders';
    return rejectWithValue(message);
  }
});

export const fetchOrderById = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>('orders/fetchOrderById', async (id, { rejectWithValue }) => {
  try {
    return await orderService.getOrderById(id);
  } catch (error: any) {
    const message = error.message || 'Failed to fetch order';
    return rejectWithValue(message);
  }
});

export const createOrder = createAsyncThunk<
  Order,
  CreateOrderRequest,
  { rejectValue: string }
>('orders/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    //console.log('orderData', orderData);
    return await orderService.createOrder(orderData);
  } catch (error: any) {
    const message = error.message || 'Failed to create order';
    return rejectWithValue(message);
  }
});

export const createOrderFromQuote = createAsyncThunk<
  Order,
  CreateOrderFromQuoteRequest,
  { rejectValue: string }
>('orders/createOrderFromQuote', async (orderData, { rejectWithValue }) => {
  try {
    return await orderService.createOrderFromQuote(orderData);
  } catch (error: any) {
    const message = error.message || 'Failed to create order from quote';
    return rejectWithValue(message);
  }
});

export const updateOrder = createAsyncThunk<
  Order,
  { id: string; orderData: UpdateOrderRequest },
  { rejectValue: string }
>('orders/updateOrder', async ({ id, orderData }, { rejectWithValue }) => {
  try {
    return await orderService.updateOrder(id, orderData);
  } catch (error: any) {
    const message = error.message || 'Failed to update order';
    return rejectWithValue(message);
  }
});

export const deleteOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('orders/deleteOrder', async (id, { rejectWithValue }) => {
  try {
    await orderService.deleteOrder(id);
    return id;
  } catch (error: any) {
    const message = error.message || 'Failed to delete order';
    return rejectWithValue(message);
  }
});

export const convertOrderToInvoice = createAsyncThunk<
  any,
  { id: string; data: ConvertToInvoiceRequest },
  { rejectValue: string }
>('orders/convertToInvoice', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await orderService.convertToInvoice(id, data);
  } catch (error: any) {
    const message = error.message || 'Failed to convert order to invoice';
    return rejectWithValue(message);
  }
});

// Order slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })
      
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch order';
      })
      
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create order';
      })
      
      // Create order from quote
      .addCase(createOrderFromQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrderFromQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrderFromQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create order from quote';
      })
      
      // Update order
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update order';
      })
      
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.filter(o => o.id !== action.payload);
        if (state.currentOrder?.id === action.payload) {
          state.currentOrder = null;
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete order';
      })
      
      // Convert to invoice
      .addCase(convertOrderToInvoice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(convertOrderToInvoice.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(convertOrderToInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to convert order to invoice';
      });
  }
});

export const { clearCurrentOrder, resetError } = orderSlice.actions;

export default orderSlice.reducer; 