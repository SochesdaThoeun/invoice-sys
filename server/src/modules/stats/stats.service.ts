import { AppDataSource } from '../../data-source';
import { Invoice, InvoiceStatus } from '../../entities/Invoice';
import { Customer } from '../../entities/Customer';
import { OrderCart } from '../../entities/OrderCart';

export interface MonthlyStats {
  month: string;
  totalRevenue: number;
  totalCustomers: number;
  totalInvoices: number;
  totalProductsSold: number;
}

export interface StatsResponse {
  months: MonthlyStats[];
}

export class StatsService {
  private invoiceRepository = AppDataSource.getRepository(Invoice);
  private customerRepository = AppDataSource.getRepository(Customer);
  private orderCartRepository = AppDataSource.getRepository(OrderCart);

  /**
   * Get monthly stats for the last 4 months for the given seller
   */
  async getMonthlyStats(sellerId: string): Promise<StatsResponse> {
    const last4Months = this.getLast4Months();
    const monthlyStats: MonthlyStats[] = [];

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
  private async getStatsForMonth(sellerId: string, startDate: Date, endDate: Date) {
    // Get total revenue from issued/paid invoices
    const revenueResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalAmount)', 'totalRevenue')
      .where('invoice.sellerId = :sellerId', { sellerId })
      .andWhere('invoice.status IN (:...statuses)', { statuses: [InvoiceStatus.ISSUED, InvoiceStatus.PAID] })
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
  private getLast4Months() {
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