"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const uuid_1 = require("uuid");
const data_source_1 = require("../../data-source");
const LedgerEntry_1 = require("../../entities/LedgerEntry");
const Category_1 = require("../../entities/Category");
const typeorm_1 = require("typeorm");
class LedgerService {
    constructor() {
        this.ledgerRepository = data_source_1.AppDataSource.getRepository(LedgerEntry_1.LedgerEntry);
        this.categoryRepository = data_source_1.AppDataSource.getRepository(Category_1.Category);
        /**
         * Creates ledger entries for a quote
         */
        this.createQuoteEntries = async (sellerId, quoteId, totalAmount, description) => {
            // Generate a transaction group ID to link related entries
            const transactionGroupId = (0, uuid_1.v4)();
            // Find appropriate categories (this is simplified; in reality, you'd have predefined category IDs)
            const receivableCategory = await this.findOrCreateCategory(sellerId, Category_1.CategoryType.ASSET, 'Accounts Receivable');
            const quoteIncomeCategory = await this.findOrCreateCategory(sellerId, Category_1.CategoryType.INCOME, 'Potential Income');
            // Create the debit entry (increase in assets - receivables)
            const debitEntry = this.ledgerRepository.create({
                sellerId,
                debit: totalAmount,
                credit: 0,
                categoryId: receivableCategory.id,
                sourceType: LedgerEntry_1.SourceType.QUOTE,
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
                sourceType: LedgerEntry_1.SourceType.QUOTE,
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
        this.createOrderEntries = async (sellerId, orderId, totalAmount, description) => {
            // Generate a transaction group ID to link related entries
            const transactionGroupId = (0, uuid_1.v4)();
            // Find appropriate categories
            const receivableCategory = await this.findOrCreateCategory(sellerId, Category_1.CategoryType.ASSET, 'Accounts Receivable');
            const orderIncomeCategory = await this.findOrCreateCategory(sellerId, Category_1.CategoryType.INCOME, 'Sales Income');
            // Create the debit entry (increase in assets - receivables)
            const debitEntry = this.ledgerRepository.create({
                sellerId,
                debit: totalAmount,
                credit: 0,
                categoryId: receivableCategory.id,
                sourceType: LedgerEntry_1.SourceType.ORDER,
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
                sourceType: LedgerEntry_1.SourceType.ORDER,
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
        this.createInvoiceEntries = async (sellerId, invoiceId, totalAmount, description) => {
            // Generate a transaction group ID to link related entries
            const transactionGroupId = (0, uuid_1.v4)();
            // Find appropriate categories
            const receivableCategory = await this.findOrCreateCategory(sellerId, Category_1.CategoryType.ASSET, 'Accounts Receivable');
            const invoiceIncomeCategory = await this.findOrCreateCategory(sellerId, Category_1.CategoryType.INCOME, 'Invoice Revenue');
            // Create the debit entry (increase in assets - receivables)
            const debitEntry = this.ledgerRepository.create({
                sellerId,
                debit: totalAmount,
                credit: 0,
                categoryId: receivableCategory.id,
                sourceType: LedgerEntry_1.SourceType.INVOICE,
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
                sourceType: LedgerEntry_1.SourceType.INVOICE,
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
        this.createPaymentEntries = async (sellerId, invoiceId, totalAmount, description) => {
            // Generate a transaction group ID to link related entries
            const transactionGroupId = (0, uuid_1.v4)();
            // Find appropriate categories
            const cashCategory = await this.findOrCreateCategory(sellerId, Category_1.CategoryType.ASSET, 'Cash');
            const receivableCategory = await this.findOrCreateCategory(sellerId, Category_1.CategoryType.ASSET, 'Accounts Receivable');
            // Create the debit entry (increase in cash)
            const debitEntry = this.ledgerRepository.create({
                sellerId,
                debit: totalAmount,
                credit: 0,
                categoryId: cashCategory.id,
                sourceType: LedgerEntry_1.SourceType.PAYMENT,
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
                sourceType: LedgerEntry_1.SourceType.PAYMENT,
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
        this.getLedgerEntries = async (sellerId, filters) => {
            const { startDate, endDate, categoryId, sourceType } = filters;
            const where = { sellerId };
            if (startDate && endDate) {
                where.createdAt = (0, typeorm_1.Between)(startDate, endDate);
            }
            else if (startDate) {
                where.createdAt = (0, typeorm_1.Between)(startDate, new Date());
            }
            else if (endDate) {
                where.createdAt = (0, typeorm_1.LessThanOrEqual)(endDate);
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
        this.getLedgerEntryById = async (sellerId, id) => {
            return this.ledgerRepository.findOne({
                where: { sellerId, id },
                relations: ['category']
            });
        };
        /**
         * Create manual ledger entries (for expenses or adjustments)
         */
        this.createManualEntries = async (sellerId, debitCategoryId, creditCategoryId, amount, description) => {
            // Generate a transaction group ID to link related entries
            const transactionGroupId = (0, uuid_1.v4)();
            // Create the debit entry
            const debitEntry = this.ledgerRepository.create({
                sellerId,
                debit: amount,
                credit: 0,
                categoryId: debitCategoryId,
                sourceType: LedgerEntry_1.SourceType.ADJUSTMENT,
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
                sourceType: LedgerEntry_1.SourceType.ADJUSTMENT,
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
        this.getFinancialSummary = async (sellerId, startDate, endDate) => {
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
            }, {});
            // Find all relevant ledger entries
            const where = { sellerId };
            if (startDate && endDate) {
                where.createdAt = (0, typeorm_1.Between)(startDate, endDate);
            }
            else if (startDate) {
                where.createdAt = (0, typeorm_1.Between)(startDate, new Date());
            }
            else if (endDate) {
                where.createdAt = (0, typeorm_1.LessThanOrEqual)(endDate);
            }
            const ledgerEntries = await this.ledgerRepository.find({ where });
            // Calculate totals
            let totalIncome = 0;
            let totalExpenses = 0;
            let totalAssets = 0;
            let totalLiabilities = 0;
            for (const entry of ledgerEntries) {
                const category = categories.find(c => c.id === entry.categoryId);
                if (!category)
                    continue;
                switch (category.type) {
                    case Category_1.CategoryType.INCOME:
                        totalIncome += entry.credit - entry.debit;
                        break;
                    case Category_1.CategoryType.EXPENSE:
                        totalExpenses += entry.debit - entry.credit;
                        break;
                    case Category_1.CategoryType.ASSET:
                        totalAssets += entry.debit - entry.credit;
                        break;
                    case Category_1.CategoryType.LIABILITY:
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
        this.getProfitAndLoss = async (sellerId, startDate, endDate) => {
            // Default dates if not provided
            const effectiveStartDate = startDate || new Date(new Date().getFullYear(), 0, 1); // Jan 1 of current year
            const effectiveEndDate = endDate || new Date();
            // Find categories for income and expenses
            const incomeCategories = await this.categoryRepository.find({
                where: { sellerId, type: Category_1.CategoryType.INCOME }
            });
            const expenseCategories = await this.categoryRepository.find({
                where: { sellerId, type: Category_1.CategoryType.EXPENSE }
            });
            // Find relevant ledger entries
            const ledgerEntries = await this.ledgerRepository.find({
                where: {
                    sellerId,
                    createdAt: (0, typeorm_1.Between)(effectiveStartDate, effectiveEndDate),
                    categoryId: (0, typeorm_1.In)([
                        ...incomeCategories.map(c => c.id),
                        ...expenseCategories.map(c => c.id)
                    ])
                },
                relations: ['category']
            });
            // Initialize result objects
            const incomeByCategory = {};
            const expensesByCategory = {};
            let totalIncome = 0;
            let totalExpenses = 0;
            // Process ledger entries
            for (const entry of ledgerEntries) {
                if (!entry.category)
                    continue;
                if (entry.category.type === Category_1.CategoryType.INCOME) {
                    const netAmount = entry.credit - entry.debit;
                    incomeByCategory[entry.category.name] = (incomeByCategory[entry.category.name] || 0) + netAmount;
                    totalIncome += netAmount;
                }
                else if (entry.category.type === Category_1.CategoryType.EXPENSE) {
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
        this.getBalanceSheet = async (sellerId, asOfDate = new Date()) => {
            // Find categories for assets and liabilities
            const assetCategories = await this.categoryRepository.find({
                where: { sellerId, type: Category_1.CategoryType.ASSET }
            });
            const liabilityCategories = await this.categoryRepository.find({
                where: { sellerId, type: Category_1.CategoryType.LIABILITY }
            });
            // Find relevant ledger entries
            const ledgerEntries = await this.ledgerRepository.find({
                where: {
                    sellerId,
                    createdAt: (0, typeorm_1.LessThanOrEqual)(asOfDate),
                    categoryId: (0, typeorm_1.In)([
                        ...assetCategories.map(c => c.id),
                        ...liabilityCategories.map(c => c.id)
                    ])
                },
                relations: ['category']
            });
            // Initialize result objects
            const assets = {};
            const liabilities = {};
            let totalAssets = 0;
            let totalLiabilities = 0;
            // Process ledger entries
            for (const entry of ledgerEntries) {
                if (!entry.category)
                    continue;
                if (entry.category.type === Category_1.CategoryType.ASSET) {
                    const netAmount = entry.debit - entry.credit;
                    assets[entry.category.name] = (assets[entry.category.name] || 0) + netAmount;
                    totalAssets += netAmount;
                }
                else if (entry.category.type === Category_1.CategoryType.LIABILITY) {
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
        this.getIncomeStatement = async (sellerId, startDate, endDate, groupBy = 'month' // 'day', 'month', 'year'
        ) => {
            // Default dates if not provided
            const effectiveStartDate = startDate || new Date(new Date().getFullYear(), 0, 1); // Jan 1 of current year
            const effectiveEndDate = endDate || new Date();
            // Find categories for income and expenses
            const incomeCategories = await this.categoryRepository.find({
                where: { sellerId, type: Category_1.CategoryType.INCOME }
            });
            const expenseCategories = await this.categoryRepository.find({
                where: { sellerId, type: Category_1.CategoryType.EXPENSE }
            });
            // Find relevant ledger entries
            const ledgerEntries = await this.ledgerRepository.find({
                where: {
                    sellerId,
                    createdAt: (0, typeorm_1.Between)(effectiveStartDate, effectiveEndDate),
                    categoryId: (0, typeorm_1.In)([
                        ...incomeCategories.map(c => c.id),
                        ...expenseCategories.map(c => c.id)
                    ])
                },
                relations: ['category'],
                order: { createdAt: 'ASC' }
            });
            // Group entries by period
            const entriesByPeriod = {};
            for (const entry of ledgerEntries) {
                const date = new Date(entry.createdAt);
                let periodLabel;
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
                const income = {};
                const expenses = {};
                let totalIncome = 0;
                let totalExpenses = 0;
                for (const entry of periodEntries) {
                    if (!entry.category)
                        continue;
                    if (entry.category.type === Category_1.CategoryType.INCOME) {
                        const netAmount = entry.credit - entry.debit;
                        income[entry.category.name] = (income[entry.category.name] || 0) + netAmount;
                        totalIncome += netAmount;
                    }
                    else if (entry.category.type === Category_1.CategoryType.EXPENSE) {
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
        this.findOrCreateCategory = async (sellerId, type, name) => {
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
}
exports.LedgerService = LedgerService;
