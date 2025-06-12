"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const invoice_service_1 = require("./invoice.service");
const Invoice_1 = require("../../entities/Invoice");
class InvoiceController {
    constructor() {
        this.getAllInvoices = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const invoices = await this.invoiceService.findAll(sellerId);
                res.status(200).json(invoices);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to get invoices', error });
            }
        };
        this.getInvoiceById = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const invoice = await this.invoiceService.findById(req.params.id, sellerId);
                if (!invoice) {
                    res.status(404).json({ message: 'Invoice not found' });
                    return;
                }
                res.status(200).json(invoice);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to get invoice', error });
            }
        };
        this.createInvoice = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const { customerId, language, governmentTemplate, orderId, orderCarts, paymentTypeId } = req.body;
                // Validate required fields
                if (!customerId) {
                    res.status(400).json({ message: 'customerId is required' });
                    return;
                }
                // Validation for orderCarts if present
                if (orderCarts) {
                    if (!Array.isArray(orderCarts) || orderCarts.length === 0) {
                        res.status(400).json({ message: 'orderCarts must be a non-empty array' });
                        return;
                    }
                    for (const cart of orderCarts) {
                        if (typeof cart.quantity !== 'number' || typeof cart.unitPrice !== 'number') {
                            res.status(400).json({ message: 'Each orderCart must have quantity and unitPrice' });
                            return;
                        }
                        // If productId is provided, we only need productId, quantity, unitPrice
                        if (cart.productId) {
                            // Description is optional when productId is provided
                            continue;
                        }
                        // If no productId, require name, sku, description
                        if (!cart.name) {
                            res.status(400).json({ message: 'Each custom orderCart (without productId) must have name' });
                            return;
                        }
                    }
                }
                const invoice = await this.invoiceService.create({
                    sellerId,
                    customerId,
                    language,
                    governmentTemplate,
                    orderId,
                    status: Invoice_1.InvoiceStatus.DRAFT
                }, paymentTypeId, orderCarts);
                res.status(201).json(invoice);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to create invoice';
                const status = errorMessage.includes('not found') ? 404 : errorMessage.includes('orderCart') ? 400 : 500;
                res.status(status).json({ message: errorMessage, error });
            }
        };
        this.updateInvoice = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const { language, governmentTemplate, status, orderCarts } = req.body;
                // Validation for orderCarts if present
                if (orderCarts) {
                    if (!Array.isArray(orderCarts) || orderCarts.length === 0) {
                        res.status(400).json({ message: 'orderCarts must be a non-empty array' });
                        return;
                    }
                    for (const cart of orderCarts) {
                        if (typeof cart.quantity !== 'number' || typeof cart.unitPrice !== 'number') {
                            res.status(400).json({ message: 'Each orderCart must have quantity and unitPrice' });
                            return;
                        }
                        // If productId is provided, we only need productId, quantity, unitPrice
                        if (cart.productId) {
                            // Description is optional when productId is provided
                            continue;
                        }
                        // If no productId, require name, sku, description
                        if (!cart.name) {
                            res.status(400).json({ message: 'Each custom orderCart (without productId) must have name' });
                            return;
                        }
                    }
                }
                const updatedInvoice = await this.invoiceService.update(req.params.id, sellerId, {
                    language,
                    governmentTemplate,
                    status
                }, orderCarts);
                res.status(200).json(updatedInvoice);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to update invoice';
                const status = errorMessage.includes('not found') ? 404 : errorMessage.includes('orderCart') ? 400 : 500;
                res.status(status).json({ message: errorMessage, error });
            }
        };
        this.deleteInvoice = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const success = await this.invoiceService.delete(req.params.id, sellerId);
                if (!success) {
                    res.status(404).json({ message: 'Invoice not found or could not be deleted' });
                    return;
                }
                res.status(204).send();
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete invoice';
                res.status(500).json({ message: errorMessage, error });
            }
        };
        this.issueInvoice = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const updatedInvoice = await this.invoiceService.update(req.params.id, sellerId, { status: Invoice_1.InvoiceStatus.ISSUED });
                res.status(200).json(updatedInvoice);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to issue invoice';
                res.status(500).json({ message: errorMessage, error });
            }
        };
        this.markAsPaid = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const updatedInvoice = await this.invoiceService.update(req.params.id, sellerId, { status: Invoice_1.InvoiceStatus.PAID });
                res.status(200).json(updatedInvoice);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to mark invoice as paid';
                res.status(500).json({ message: errorMessage, error });
            }
        };
        this.invoiceService = new invoice_service_1.InvoiceService();
    }
}
exports.InvoiceController = InvoiceController;
