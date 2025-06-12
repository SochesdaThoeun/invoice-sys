import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import productRoutes from './modules/product/product.routes';
import taxCodeRoutes from './modules/tax-code/tax-code.routes';
import customerRoutes from './modules/customer/customer.routes';
import quoteRoutes from './modules/quote/quote.routes';
import orderRoutes from './modules/order/order.routes';
import invoiceRoutes from './modules/invoice/invoice.routes';
import paymentTypeRoutes from './modules/payment-type/payment-type.routes';
import categoryRoutes from './modules/category/category.routes';
import ledgerRoutes from './modules/ledger/ledger.routes';
import businessAddressRoutes from './modules/business-address/business-address.routes';
import statsRoutes from './modules/stats/stats.routes';
import { AppDataSource } from './data-source';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Apply global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// somewhere in your app startup
AppDataSource.initialize()
  .then(() => console.log('DataSource initialized'))
  .catch((err: any) => console.error('DataSource failed:', err));

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tax-codes', taxCodeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payment-types', paymentTypeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/business-addresses', businessAddressRoutes);
app.use('/api/stats', statsRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 