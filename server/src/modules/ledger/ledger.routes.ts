import { Router } from 'express';
import { LedgerController } from './ledger.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const ledgerController = new LedgerController();

// Get all ledger entries with optional filtering
router.get('/', authMiddleware, ledgerController.getAllLedgerEntries);

// Get ledger entry by ID
router.get('/:id', authMiddleware, ledgerController.getLedgerEntryById);

// Create a manual ledger entry
router.post('/manual', authMiddleware, ledgerController.createManualEntry);

// Get financial summary
router.get('/reports/summary', authMiddleware, ledgerController.getFinancialSummary);

// Get profit and loss statement
router.get('/reports/profit-loss', authMiddleware, ledgerController.getProfitAndLoss);

// Get balance sheet
router.get('/reports/balance-sheet', authMiddleware, ledgerController.getBalanceSheet);

// Get income statement
router.get('/reports/income-statement', authMiddleware, ledgerController.getIncomeStatement);

export default router; 