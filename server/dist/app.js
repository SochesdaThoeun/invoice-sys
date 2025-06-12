"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const product_routes_1 = __importDefault(require("./modules/product/product.routes"));
const tax_code_routes_1 = __importDefault(require("./modules/tax-code/tax-code.routes"));
const customer_routes_1 = __importDefault(require("./modules/customer/customer.routes"));
const quote_routes_1 = __importDefault(require("./modules/quote/quote.routes"));
const order_routes_1 = __importDefault(require("./modules/order/order.routes"));
const invoice_routes_1 = __importDefault(require("./modules/invoice/invoice.routes"));
const payment_type_routes_1 = __importDefault(require("./modules/payment-type/payment-type.routes"));
const category_routes_1 = __importDefault(require("./modules/category/category.routes"));
const ledger_routes_1 = __importDefault(require("./modules/ledger/ledger.routes"));
const business_address_routes_1 = __importDefault(require("./modules/business-address/business-address.routes"));
const stats_routes_1 = __importDefault(require("./modules/stats/stats.routes"));
const data_source_1 = require("./data-source");
// Load environment variables
dotenv_1.default.config();
// Initialize express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Apply global middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// somewhere in your app startup
data_source_1.AppDataSource.initialize()
    .then(() => console.log('DataSource initialized'))
    .catch((err) => console.error('DataSource failed:', err));
// Apply routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/tax-codes', tax_code_routes_1.default);
app.use('/api/customers', customer_routes_1.default);
app.use('/api/quotes', quote_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/invoices', invoice_routes_1.default);
app.use('/api/payment-types', payment_type_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/ledger', ledger_routes_1.default);
app.use('/api/business-addresses', business_address_routes_1.default);
app.use('/api/stats', stats_routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
