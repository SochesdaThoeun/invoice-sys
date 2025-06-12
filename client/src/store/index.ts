import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import settingsReducer from '../features/settings/settingsSlice';
import quotesReducer from '../features/quotes/quoteSlice';
import ordersReducer from '../features/orders/orderSlice';
import invoicesReducer from '../features/invoices/invoiceSlice';
import customersReducer from '../features/customers/customerSlice';
import taxReducer from '../features/tax/taxSlice';
import productsReducer from '../features/products/productSlice';
import paymentTypesReducer from '../features/payment-types/paymentTypeSlice';
import businessAddressesReducer from '../features/business-addresses/businessAddressSlice';
import reportsReducer from '../features/reports/reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    quotes: quotesReducer,
    orders: ordersReducer,
    invoices: invoicesReducer,
    customers: customersReducer,
    tax: taxReducer,
    products: productsReducer,
    paymentTypes: paymentTypesReducer,
    businessAddresses: businessAddressesReducer,
    reports: reportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 