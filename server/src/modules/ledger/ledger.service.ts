import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../../data-source';
import { LedgerEntry, SourceType } from '../../entities/LedgerEntry';
import { Category, CategoryType } from '../../entities/Category';
import { Between, FindOptionsWhere, In, LessThanOrEqual } from 'typeorm';

export class LedgerService {
  private ledgerRepository = AppDataSource.getRepository(LedgerEntry);
  private categoryRepository = AppDataSource.getRepository(Category);

  /**
   * Creates ledger entries for a quote
   */
  public createQuoteEntries = async (
    sellerId: string,
    quoteId: string,
    totalAmount: number,
    description: string
  ): Promise<LedgerEntry[]> => {
    // Generate a transaction group ID to link related entries
    const transactionGroupId = uuidv4();

    // Find appropriate categories (this is simplified; in reality, you'd have predefined category IDs)
    const receivableCategory = await this.findOrCreateCategory(sellerId, CategoryType.ASSET, 'Accounts Receivable');
    const quoteIncomeCategory = await this.findOrCreateCategory(sellerId, CategoryType.INCOME, 'Potential Income');

    // Create the debit entry (increase in assets - receivables)
    const debitEntry = this.ledgerRepository.create({
      sellerId,
      debit: totalAmount,
      credit: 0,
      categoryId: receivableCategory.id,
      sourceType: SourceType.QUOTE,
      sourceId: quoteId,
      transactionGroupId,
      description: `Quote ${description}`
    });

    // Create the credit entry (increase in potential income)
    const creditEntry = this.ledgerRepository.create({
      sellerId,
      debit: 0,
      credit: totalAmount,
      categoryId: quoteIncomeCategory.id,
      sourceType: SourceType.QUOTE,
      sourceId: quoteId,
      transactionGroupId,
      description: `Quote ${description}`
    });

    // Save both entries
    return this.ledgerRepository.save([debitEntry, creditEntry]);
  };

  /**
   * Creates ledger entries for an order
   */
  public createOrderEntries = async (
    sellerId: string,
    orderId: string,
    totalAmount: number,
    description: string
  ): Promise<LedgerEntry[]> => {
    // Generate a transaction group ID to link related entries
    const transactionGroupId = uuidv4();

    // Find appropriate categories
    const receivableCategory = await this.findOrCreateCategory(sellerId, CategoryType.ASSET, 'Accounts Receivable');
    const orderIncomeCategory = await this.findOrCreateCategory(sellerId, CategoryType.INCOME, 'Sales Income');

    // Create the debit entry (increase in assets - receivables)
    const debitEntry = this.ledgerRepository.create({
      sellerId,
      debit: totalAmount,
      credit: 0,
      categoryId: receivableCategory.id,
      sourceType: SourceType.ORDER,
      sourceId: orderId,
      transactionGroupId,
      description: `Order ${description}`
    });

    // Create the credit entry (increase in sales income)
    const creditEntry = this.ledgerRepository.create({
      sellerId,
      debit: 0,
      credit: totalAmount,
      categoryId: orderIncomeCategory.id,
      sourceType: SourceType.ORDER,
      sourceId: orderId,
      transactionGroupId,
      description: `Order ${description}`
    });

    // Save both entries
    return this.ledgerRepository.save([debitEntry, creditEntry]);
  };

  /**
   * Creates ledger entries for an invoice
   */
  public createInvoiceEntries = async (
    sellerId: string,
    invoiceId: string,
    totalAmount: number,
    description: string
  ): Promise<LedgerEntry[]> => {
    // Generate a transaction group ID to link related entries
    const transactionGroupId = uuidv4();

    // Find appropriate categories
    const receivableCategory = await this.findOrCreateCategory(sellerId, CategoryType.ASSET, 'Accounts Receivable');
    const invoiceIncomeCategory = await this.findOrCreateCategory(sellerId, CategoryType.INCOME, 'Invoice Revenue');

    // Create the debit entry (increase in assets - receivables)
    const debitEntry = this.ledgerRepository.create({
      sellerId,
      debit: totalAmount,
      credit: 0,
      categoryId: receivableCategory.id,
      sourceType: SourceType.INVOICE,
      sourceId: invoiceId,
      transactionGroupId,
      description: `Invoice ${description}`
    });

    // Create the credit entry (increase in invoice revenue)
    const creditEntry = this.ledgerRepository.create({
      sellerId,
      debit: 0,
      credit: totalAmount,
      categoryId: invoiceIncomeCategory.id,
      sourceType: SourceType.INVOICE,
      sourceId: invoiceId,
      transactionGroupId,
      description: `Invoice ${description}`
    });

    // Save both entries
    return this.ledgerRepository.save([debitEntry, creditEntry]);
  };

  /**
   * Creates ledger entries for a payment on an invoice
   */
  public createPaymentEntries = async (
    sellerId: string,
    invoiceId: string,
    totalAmount: number,
    description: string
  ): Promise<LedgerEntry[]> => {
    // Generate a transaction group ID to link related entries
    const transactionGroupId = uuidv4();

    // Find appropriate categories
    const cashCategory = await this.findOrCreateCategory(sellerId, CategoryType.ASSET, 'Cash');
    const receivableCategory = await this.findOrCreateCategory(sellerId, CategoryType.ASSET, 'Accounts Receivable');

    // Create the debit entry (increase in cash)
    const debitEntry = this.ledgerRepository.create({
      sellerId,
      debit: totalAmount,
      credit: 0,
      categoryId: cashCategory.id,
      sourceType: SourceType.PAYMENT,
      sourceId: invoiceId,
      transactionGroupId,
      description: `Payment ${description}`
    });

    // Create the credit entry (decrease in accounts receivable)
    const creditEntry = this.ledgerRepository.create({
      sellerId,
      debit: 0,
      credit: totalAmount,
      categoryId: receivableCategory.id,
      sourceType: SourceType.PAYMENT,
      sourceId: invoiceId,
      transactionGroupId,
      description: `Payment ${description}`
    });

    // Save both entries
    return this.ledgerRepository.save([debitEntry, creditEntry]);
  };

  /**
   * Get ledger entries with optional filtering
   */
  public getLedgerEntries = async (
    sellerId: string,
    filters: {
      startDate?: Date;
      endDate?: Date;
      categoryId?: string;
      sourceType?: SourceType;
    }
  ): Promise<LedgerEntry[]> => {
    const { startDate, endDate, categoryId, sourceType } = filters;
    
    const where: FindOptionsWhere<LedgerEntry> = { sellerId };
    
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = Between(startDate, new Date());
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (sourceType) {
      where.sourceType = sourceType;
    }
    
    return this.ledgerRepository.find({
      where,
      relations: ['category'],
      order: { createdAt: 'DESC' }
    });
  };

  /**
   * Get a single ledger entry by ID
   */
  public getLedgerEntryById = async (
    sellerId: string,
    id: string
  ): Promise<LedgerEntry | null> => {
    return this.ledgerRepository.findOne({
      where: { sellerId, id },
      relations: ['category']
    });
  };

  /**
   * Create manual ledger entries (for expenses or adjustments)
   */
  public createManualEntries = async (
    sellerId: string,
    debitCategoryId: string,
    creditCategoryId: string,
    amount: number,
    description: string
  ): Promise<LedgerEntry[]> => {
    // Generate a transaction group ID to link related entries
    const transactionGroupId = uuidv4();

    // Create the debit entry
    const debitEntry = this.ledgerRepository.create({
      sellerId,
      debit: amount,
      credit: 0,
      categoryId: debitCategoryId,
      sourceType: SourceType.ADJUSTMENT,
      sourceId: transactionGroupId, // Use the transaction group ID as the source ID for manual entries
      transactionGroupId,
      description
    });

    // Create the credit entry
    const creditEntry = this.ledgerRepository.create({
      sellerId,
      debit: 0,
      credit: amount,
      categoryId: creditCategoryId,
      sourceType: SourceType.ADJUSTMENT,
      sourceId: transactionGroupId,
      transactionGroupId,
      description
    });

    // Save both entries
    return this.ledgerRepository.save([debitEntry, creditEntry]);
  };

  /**
   * Get a financial summary based on ledger entries
   */
  public getFinancialSummary = async (
    sellerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    totalAssets: number;
    totalLiabilities: number;
  }> => {
    // Find all categories for this seller
    const categories = await this.categoryRepository.find({
      where: { sellerId }
    });
    
    // Group categories by type
    const categoriesByType = categories.reduce((acc, category) => {
      if (!acc[category.type]) {
        acc[category.type] = [];
      }
      acc[category.type].push(category.id);
      return acc;
    }, {} as Record<CategoryType, string[]>);
    
    // Find all relevant ledger entries
    const where: FindOptionsWhere<LedgerEntry> = { sellerId };
    
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = Between(startDate, new Date());
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }
    
    const ledgerEntries = await this.ledgerRepository.find({ where });
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalAssets = 0;
    let totalLiabilities = 0;
    
    for (const entry of ledgerEntries) {
      const category = categories.find(c => c.id === entry.categoryId);
      if (!category) continue;
      
      switch (category.type) {
        case CategoryType.INCOME:
          totalIncome += entry.credit - entry.debit;
          break;
        case CategoryType.EXPENSE:
          totalExpenses += entry.debit - entry.credit;
          break;
        case CategoryType.ASSET:
          totalAssets += entry.debit - entry.credit;
          break;
        case CategoryType.LIABILITY:
          totalLiabilities += entry.credit - entry.debit;
          break;
      }
    }
    
    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      totalAssets,
      totalLiabilities
    };
  };

  /**
   * Get profit and loss statement
   */
  public getProfitAndLoss = async (
    sellerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    incomeByCategory: Record<string, number>;
    expensesByCategory: Record<string, number>;
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    period: { startDate: Date; endDate: Date };
  }> => {
    // Default dates if not provided
    const effectiveStartDate = startDate || new Date(new Date().getFullYear(), 0, 1); // Jan 1 of current year
    const effectiveEndDate = endDate || new Date();
    
    // Find categories for income and expenses
    const incomeCategories = await this.categoryRepository.find({
      where: { sellerId, type: CategoryType.INCOME }
    });
    
    const expenseCategories = await this.categoryRepository.find({
      where: { sellerId, type: CategoryType.EXPENSE }
    });
    
    // Find relevant ledger entries
    const ledgerEntries = await this.ledgerRepository.find({
      where: {
        sellerId,
        createdAt: Between(effectiveStartDate, effectiveEndDate),
        categoryId: In([
          ...incomeCategories.map(c => c.id),
          ...expenseCategories.map(c => c.id)
        ])
      },
      relations: ['category']
    });
    
    // Initialize result objects
    const incomeByCategory: Record<string, number> = {};
    const expensesByCategory: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;
    
    // Process ledger entries
    for (const entry of ledgerEntries) {
      if (!entry.category) continue;
      
      if (entry.category.type === CategoryType.INCOME) {
        const netAmount = entry.credit - entry.debit;
        incomeByCategory[entry.category.name] = (incomeByCategory[entry.category.name] || 0) + netAmount;
        totalIncome += netAmount;
      } else if (entry.category.type === CategoryType.EXPENSE) {
        const netAmount = entry.debit - entry.credit;
        expensesByCategory[entry.category.name] = (expensesByCategory[entry.category.name] || 0) + netAmount;
        totalExpenses += netAmount;
      }
    }
    
    return {
      incomeByCategory,
      expensesByCategory,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      period: {
        startDate: effectiveStartDate,
        endDate: effectiveEndDate
      }
    };
  };

  /**
   * Get balance sheet
   */
  public getBalanceSheet = async (
    sellerId: string,
    asOfDate: Date = new Date()
  ): Promise<{
    assets: Record<string, number>;
    liabilities: Record<string, number>;
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    asOfDate: Date;
  }> => {
    // Find categories for assets and liabilities
    const assetCategories = await this.categoryRepository.find({
      where: { sellerId, type: CategoryType.ASSET }
    });
    
    const liabilityCategories = await this.categoryRepository.find({
      where: { sellerId, type: CategoryType.LIABILITY }
    });
    
    // Find relevant ledger entries
    const ledgerEntries = await this.ledgerRepository.find({
      where: {
        sellerId,
        createdAt: LessThanOrEqual(asOfDate),
        categoryId: In([
          ...assetCategories.map(c => c.id),
          ...liabilityCategories.map(c => c.id)
        ])
      },
      relations: ['category']
    });
    
    // Initialize result objects
    const assets: Record<string, number> = {};
    const liabilities: Record<string, number> = {};
    let totalAssets = 0;
    let totalLiabilities = 0;
    
    // Process ledger entries
    for (const entry of ledgerEntries) {
      if (!entry.category) continue;
      
      if (entry.category.type === CategoryType.ASSET) {
        const netAmount = entry.debit - entry.credit;
        assets[entry.category.name] = (assets[entry.category.name] || 0) + netAmount;
        totalAssets += netAmount;
      } else if (entry.category.type === CategoryType.LIABILITY) {
        const netAmount = entry.credit - entry.debit;
        liabilities[entry.category.name] = (liabilities[entry.category.name] || 0) + netAmount;
        totalLiabilities += netAmount;
      }
    }
    
    return {
      assets,
      liabilities,
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      asOfDate
    };
  };

  /**
   * Get income statement (similar to P&L but can be grouped by time period)
   */
  public getIncomeStatement = async (
    sellerId: string,
    startDate?: Date,
    endDate?: Date,
    groupBy: string = 'month' // 'day', 'month', 'year'
  ): Promise<{
    periods: Array<{
      periodLabel: string;
      income: Record<string, number>;
      expenses: Record<string, number>;
      totalIncome: number;
      totalExpenses: number;
      netProfit: number;
    }>;
    totalIncome: number;
    totalExpenses: number;
    totalNetProfit: number;
  }> => {
    // Default dates if not provided
    const effectiveStartDate = startDate || new Date(new Date().getFullYear(), 0, 1); // Jan 1 of current year
    const effectiveEndDate = endDate || new Date();
    
    // Find categories for income and expenses
    const incomeCategories = await this.categoryRepository.find({
      where: { sellerId, type: CategoryType.INCOME }
    });
    
    const expenseCategories = await this.categoryRepository.find({
      where: { sellerId, type: CategoryType.EXPENSE }
    });
    
    // Find relevant ledger entries
    const ledgerEntries = await this.ledgerRepository.find({
      where: {
        sellerId,
        createdAt: Between(effectiveStartDate, effectiveEndDate),
        categoryId: In([
          ...incomeCategories.map(c => c.id),
          ...expenseCategories.map(c => c.id)
        ])
      },
      relations: ['category'],
      order: { createdAt: 'ASC' }
    });
    
    // Group entries by period
    const entriesByPeriod: Record<string, LedgerEntry[]> = {};
    
    for (const entry of ledgerEntries) {
      const date = new Date(entry.createdAt);
      let periodLabel: string;
      
      switch (groupBy) {
        case 'day':
          periodLabel = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'month':
          periodLabel = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
          break;
        case 'year':
          periodLabel = date.getFullYear().toString(); // YYYY
          break;
        default:
          periodLabel = 'All'; // No grouping
      }
      
      if (!entriesByPeriod[periodLabel]) {
        entriesByPeriod[periodLabel] = [];
      }
      
      entriesByPeriod[periodLabel].push(entry);
    }
    
    // Process entries by period
    const periods = Object.keys(entriesByPeriod).sort().map(periodLabel => {
      const periodEntries = entriesByPeriod[periodLabel];
      const income: Record<string, number> = {};
      const expenses: Record<string, number> = {};
      let totalIncome = 0;
      let totalExpenses = 0;
      
      for (const entry of periodEntries) {
        if (!entry.category) continue;
        
        if (entry.category.type === CategoryType.INCOME) {
          const netAmount = entry.credit - entry.debit;
          income[entry.category.name] = (income[entry.category.name] || 0) + netAmount;
          totalIncome += netAmount;
        } else if (entry.category.type === CategoryType.EXPENSE) {
          const netAmount = entry.debit - entry.credit;
          expenses[entry.category.name] = (expenses[entry.category.name] || 0) + netAmount;
          totalExpenses += netAmount;
        }
      }
      
      return {
        periodLabel,
        income,
        expenses,
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses
      };
    });
    
    // Calculate overall totals
    let totalIncome = 0;
    let totalExpenses = 0;
    
    periods.forEach(period => {
      totalIncome += period.totalIncome;
      totalExpenses += period.totalExpenses;
    });
    
    return {
      periods,
      totalIncome,
      totalExpenses,
      totalNetProfit: totalIncome - totalExpenses
    };
  };

  /**
   * Helper method to find a category by type and name, or create it if it doesn't exist
   */
  private findOrCreateCategory = async (
    sellerId: string, 
    type: CategoryType, 
    name: string
  ): Promise<Category> => {
    // Try to find an existing category
    const existingCategory = await this.categoryRepository.findOne({
      where: { sellerId, type, name }
    });

    if (existingCategory) {
      return existingCategory;
    }

    // Create a new category if none exists
    const newCategory = this.categoryRepository.create({
      sellerId,
      type,
      name
    });

    return this.categoryRepository.save(newCategory);
  };
} 