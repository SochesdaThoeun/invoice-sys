import { Router } from 'express';
import { InvoiceController } from './invoice.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const invoiceRouter = Router();
const invoiceController = new InvoiceController();

// GET all invoices for the authenticated seller
invoiceRouter.get('/', authMiddleware, invoiceController.getAllInvoices);

// GET a specific invoice by ID
invoiceRouter.get('/:id', authMiddleware, invoiceController.getInvoiceById);

// POST create a new invoice
invoiceRouter.post('/', authMiddleware, invoiceController.createInvoice);

// PUT update an existing invoice
invoiceRouter.put('/:id', authMiddleware, invoiceController.updateInvoice);

// DELETE an invoice
invoiceRouter.delete('/:id', authMiddleware, invoiceController.deleteInvoice);

// POST issue an invoice (change status to ISSUED)
invoiceRouter.post('/:id/issue', authMiddleware, invoiceController.issueInvoice);

// POST mark an invoice as paid
invoiceRouter.post('/:id/paid', authMiddleware, invoiceController.markAsPaid);

export default invoiceRouter; 