"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("./invoice.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const invoiceRouter = (0, express_1.Router)();
const invoiceController = new invoice_controller_1.InvoiceController();
// GET all invoices for the authenticated seller
invoiceRouter.get('/', auth_middleware_1.authMiddleware, invoiceController.getAllInvoices);
// GET a specific invoice by ID
invoiceRouter.get('/:id', auth_middleware_1.authMiddleware, invoiceController.getInvoiceById);
// POST create a new invoice
invoiceRouter.post('/', auth_middleware_1.authMiddleware, invoiceController.createInvoice);
// PUT update an existing invoice
invoiceRouter.put('/:id', auth_middleware_1.authMiddleware, invoiceController.updateInvoice);
// DELETE an invoice
invoiceRouter.delete('/:id', auth_middleware_1.authMiddleware, invoiceController.deleteInvoice);
// POST issue an invoice (change status to ISSUED)
invoiceRouter.post('/:id/issue', auth_middleware_1.authMiddleware, invoiceController.issueInvoice);
// POST mark an invoice as paid
invoiceRouter.post('/:id/paid', auth_middleware_1.authMiddleware, invoiceController.markAsPaid);
exports.default = invoiceRouter;
