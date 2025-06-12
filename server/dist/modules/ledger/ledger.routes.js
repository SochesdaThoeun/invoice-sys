"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ledger_controller_1 = require("./ledger.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const ledgerController = new ledger_controller_1.LedgerController();
// Get all ledger entries with optional filtering
router.get('/', auth_middleware_1.authMiddleware, ledgerController.getAllLedgerEntries);
// Get ledger entry by ID
router.get('/:id', auth_middleware_1.authMiddleware, ledgerController.getLedgerEntryById);
// Create a manual ledger entry
router.post('/manual', auth_middleware_1.authMiddleware, ledgerController.createManualEntry);
// Get financial summary
router.get('/reports/summary', auth_middleware_1.authMiddleware, ledgerController.getFinancialSummary);
// Get profit and loss statement
router.get('/reports/profit-loss', auth_middleware_1.authMiddleware, ledgerController.getProfitAndLoss);
// Get balance sheet
router.get('/reports/balance-sheet', auth_middleware_1.authMiddleware, ledgerController.getBalanceSheet);
// Get income statement
router.get('/reports/income-statement', auth_middleware_1.authMiddleware, ledgerController.getIncomeStatement);
exports.default = router;
