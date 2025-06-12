import { Request, Response } from 'express';
import { LedgerService } from './ledger.service';
import { SourceType } from '../../entities/LedgerEntry';
import { CategoryType } from '../../entities/Category';

export class LedgerController {
  private ledgerService = new LedgerService();

  /**
   * Get all ledger entries for the authenticated seller
   */
  public getAllLedgerEntries = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { startDate, endDate, categoryId, sourceType } = req.query;
      
      // Parse dates if provided
      const startDateObj = startDate ? new Date(startDate as string) : undefined;
      const endDateObj = endDate ? new Date(endDate as string) : undefined;
      
      // Parse source type if provided
      const sourceTypeEnum = sourceType && Object.values(SourceType).includes(sourceType as SourceType) 
        ? sourceType as SourceType 
        : undefined;

      const ledgerEntries = await this.ledgerService.getLedgerEntries(
        sellerId,
        {
          startDate: startDateObj,
          endDate: endDateObj,
          categoryId: categoryId as string,
          sourceType: sourceTypeEnum
        }
      );

      res.status(200).json(ledgerEntries);
    } catch (error) {
      console.error('Error fetching ledger entries:', error);
      res.status(500).json({ message: 'Failed to fetch ledger entries', error });
    }
  };

  /**
   * Get ledger entry by ID for the authenticated seller
   */
  public getLedgerEntryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { id } = req.params;
      const ledgerEntry = await this.ledgerService.getLedgerEntryById(sellerId, id);

      if (!ledgerEntry) {
        res.status(404).json({ message: 'Ledger entry not found' });
        return;
      }

      res.status(200).json(ledgerEntry);
    } catch (error) {
      console.error('Error fetching ledger entry:', error);
      res.status(500).json({ message: 'Failed to fetch ledger entry', error });
    }
  };

  /**
   * Create a manual ledger entry for the authenticated seller
   */
  public createManualEntry = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { description, debitEntry, creditEntry } = req.body;
      
      if (!debitEntry || !creditEntry) {
        res.status(400).json({ message: 'Both debit and credit entries are required' });
        return;
      }

      if (debitEntry.amount !== creditEntry.amount) {
        res.status(400).json({ message: 'Debit and credit amounts must be equal' });
        return;
      }

      const entries = await this.ledgerService.createManualEntries(
        sellerId,
        debitEntry.categoryId,
        creditEntry.categoryId,
        debitEntry.amount,
        description
      );

      res.status(201).json(entries);
    } catch (error) {
      console.error('Error creating ledger entries:', error);
      res.status(500).json({ message: 'Failed to create ledger entries', error });
    }
  };

  /**
   * Get financial summary for the authenticated seller
   */
  public getFinancialSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { startDate, endDate } = req.query;
      
      // Parse dates if provided
      const startDateObj = startDate ? new Date(startDate as string) : undefined;
      const endDateObj = endDate ? new Date(endDate as string) : undefined;
      
      const summary = await this.ledgerService.getFinancialSummary(
        sellerId,
        startDateObj,
        endDateObj
      );

      res.status(200).json(summary);
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      res.status(500).json({ message: 'Failed to fetch financial summary', error });
    }
  };

  /**
   * Get profit and loss statement for the authenticated seller
   */
  public getProfitAndLoss = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { startDate, endDate } = req.query;
      
      // Parse dates if provided
      const startDateObj = startDate ? new Date(startDate as string) : undefined;
      const endDateObj = endDate ? new Date(endDate as string) : undefined;
      
      const profitAndLoss = await this.ledgerService.getProfitAndLoss(
        sellerId,
        startDateObj,
        endDateObj
      );

      res.status(200).json(profitAndLoss);
    } catch (error) {
      console.error('Error fetching profit and loss statement:', error);
      res.status(500).json({ message: 'Failed to fetch profit and loss statement', error });
    }
  };

  /**
   * Get balance sheet for the authenticated seller
   */
  public getBalanceSheet = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { asOfDate } = req.query;
      
      // Parse date if provided
      const asOfDateObj = asOfDate ? new Date(asOfDate as string) : new Date();
      
      const balanceSheet = await this.ledgerService.getBalanceSheet(
        sellerId,
        asOfDateObj
      );

      res.status(200).json(balanceSheet);
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      res.status(500).json({ message: 'Failed to fetch balance sheet', error });
    }
  };

  /**
   * Get income statement for the authenticated seller
   */
  public getIncomeStatement = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { startDate, endDate, groupBy } = req.query;
      
      // Parse dates if provided
      const startDateObj = startDate ? new Date(startDate as string) : undefined;
      const endDateObj = endDate ? new Date(endDate as string) : undefined;
      
      const incomeStatement = await this.ledgerService.getIncomeStatement(
        sellerId,
        startDateObj,
        endDateObj,
        groupBy as string
      );

      res.status(200).json(incomeStatement);
    } catch (error) {
      console.error('Error fetching income statement:', error);
      res.status(500).json({ message: 'Failed to fetch income statement', error });
    }
  };
} 