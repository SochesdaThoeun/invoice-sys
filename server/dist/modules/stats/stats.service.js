"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const data_source_1 = require("../../data-source");
const Invoice_1 = require("../../entities/Invoice");
const Customer_1 = require("../../entities/Customer");
const OrderCart_1 = require("../../entities/OrderCart");
class StatsService {
    constructor() {
        this.invoiceRepository = data_source_1.AppDataSource.getRepository(Invoice_1.Invoice);
        this.customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        this.orderCartRepository = data_source_1.AppDataSource.getRepository(OrderCart_1.OrderCart);
    }
    /**
     * Get monthly stats for the last 4 months for the given seller
     */
    async getMonthlyStats(sellerId) {
        const last4Months = this.getLast4Months();
        const monthlyStats = [];
        for (const monthInfo of last4Months) {
            const stats = await this.getStatsForMonth(sellerId, monthInfo.start, monthInfo.end);
            monthlyStats.push({
                month: monthInfo.label,
                ...stats
            });
        }
        return { months: monthlyStats };
    }
    /**
     * Get stats for a specific month range
     */
    async getStatsForMonth(sellerId, startDate, endDate) {
        // Get total revenue from issued/paid invoices
        const revenueResult = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('SUM(invoice.totalAmount)', 'totalRevenue')
            .where('invoice.sellerId = :sellerId', { sellerId })
            .andWhere('invoice.status IN (:...statuses)', { statuses: [Invoice_1.InvoiceStatus.ISSUED, Invoice_1.InvoiceStatus.PAID] })
            .andWhere('invoice.createdAt >= :startDate', { startDate })
            .andWhere('invoice.createdAt <= :endDate', { endDate })
            .getRawOne();
        // Get total number of customers created
        const customerResult = await this.customerRepository
            .createQueryBuilder('customer')
            .select('COUNT(customer.id)', 'totalCustomers')
            .where('customer.sellerId = :sellerId', { sellerId })
            .andWhere('customer.createdAt >= :startDate', { startDate })
            .andWhere('customer.createdAt <= :endDate', { endDate })
            .getRawOne();
        // Get total number of invoices created
        const invoiceResult = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('COUNT(invoice.id)', 'totalInvoices')
            .where('invoice.sellerId = :sellerId', { sellerId })
            .andWhere('invoice.createdAt >= :startDate', { startDate })
            .andWhere('invoice.createdAt <= :endDate', { endDate })
            .getRawOne();
        // Get total products sold (from order carts)
        const productsSoldResult = await this.orderCartRepository
            .createQueryBuilder('orderCart')
            .select('SUM(orderCart.quantity)', 'totalProductsSold')
            .where('orderCart.sellerId = :sellerId', { sellerId })
            .andWhere('orderCart.createdAt >= :startDate', { startDate })
            .andWhere('orderCart.createdAt <= :endDate', { endDate })
            .getRawOne();
        return {
            totalRevenue: parseFloat(revenueResult?.totalRevenue || '0'),
            totalCustomers: parseInt(customerResult?.totalCustomers || '0'),
            totalInvoices: parseInt(invoiceResult?.totalInvoices || '0'),
            totalProductsSold: parseInt(productsSoldResult?.totalProductsSold || '0')
        };
    }
    /**
     * Generate the last 4 months date ranges
     */
    getLast4Months() {
        const months = [];
        const now = new Date();
        for (let i = 3; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
            months.push({
                label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
                start: startDate,
                end: endDate
            });
        }
        return months;
    }
}
exports.StatsService = StatsService;
