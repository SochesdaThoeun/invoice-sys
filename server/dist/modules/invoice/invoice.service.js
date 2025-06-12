"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const data_source_1 = require("../../data-source");
const Invoice_1 = require("../../entities/Invoice");
const Order_1 = require("../../entities/Order");
const OrderCart_1 = require("../../entities/OrderCart");
const ledger_service_1 = require("../ledger/ledger.service");
const Product_1 = require("../../entities/Product");
class InvoiceService {
    constructor() {
        this.invoiceRepository = data_source_1.AppDataSource.getRepository(Invoice_1.Invoice);
        this.orderRepository = data_source_1.AppDataSource.getRepository(Order_1.Order);
        this.orderCartRepository = data_source_1.AppDataSource.getRepository(OrderCart_1.OrderCart);
        this.productRepository = data_source_1.AppDataSource.getRepository(Product_1.Product);
        this.findAll = async (sellerId) => {
            return this.invoiceRepository.find({
                where: { sellerId },
                relations: ['customer', 'order', 'order.orderCarts', 'order.paymentType'],
            });
        };
        this.findById = async (id, sellerId) => {
            return this.invoiceRepository.findOne({
                where: { id, sellerId },
                relations: ['customer', 'order', 'order.orderCarts', 'order.paymentType'],
            });
        };
        this.create = async (invoiceData, paymentTypeId, orderCarts) => {
            // Start a transaction to ensure data consistency
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                // Create an order first if not provided
                if (!invoiceData.orderId) {
                    // Create the order
                    const order = this.orderRepository.create({
                        sellerId: invoiceData.sellerId,
                        customerId: invoiceData.customerId,
                        totalAmount: invoiceData.totalAmount || 0,
                        paymentTypeId: paymentTypeId,
                        orderCarts: orderCarts || [],
                    });
                    // Save the order
                    const savedOrder = await this.orderRepository.save(order);
                    invoiceData.orderId = savedOrder.id;
                    // If order carts are provided, associate them with the order
                    if (orderCarts && orderCarts.length > 0) {
                        // Validate orderCarts
                        for (const cart of orderCarts) {
                            if (typeof cart.quantity !== 'number' || typeof cart.unitPrice !== 'number') {
                                throw new Error('Each orderCart must have quantity and unitPrice');
                            }
                            // If no productId, require name, sku, description
                            if (!cart.productId && (!cart.name)) {
                                throw new Error('Each custom orderCart (without productId) must have name');
                            }
                        }
                        let totalAmount = 0;
                        for (const cartItem of orderCarts) {
                            let orderCartData = {
                                orderId: savedOrder.id,
                                sellerId: invoiceData.sellerId,
                                quantity: cartItem.quantity,
                                unitPrice: cartItem.unitPrice,
                                lineTotal: Number(cartItem.quantity) * Number(cartItem.unitPrice),
                                taxRate: cartItem.taxRate || 0
                            };
                            // If productId is provided, get product details
                            if (cartItem.productId) {
                                const product = await this.productRepository.findOne({
                                    where: { id: cartItem.productId, sellerId: invoiceData.sellerId },
                                    relations: ['taxCode']
                                });
                                if (product) {
                                    orderCartData = {
                                        ...orderCartData,
                                        productId: product.id,
                                        sku: product.sku,
                                        name: product.name,
                                        description: cartItem.description || product.description,
                                        taxCodeId: product.taxCodeId,
                                        taxRate: product.taxCode?.rate || cartItem.taxRate || 0
                                    };
                                }
                                else {
                                    throw new Error(`Product with ID ${cartItem.productId} not found`);
                                }
                            }
                            else {
                                // If no productId, use the provided cart data directly
                                orderCartData = {
                                    ...orderCartData,
                                    sku: cartItem.sku || 'CUSTOM-ITEM',
                                    name: cartItem.name,
                                    description: cartItem.description || '',
                                    taxCodeId: cartItem.taxCodeId,
                                };
                            }
                            const orderCart = this.orderCartRepository.create(orderCartData);
                            await this.orderCartRepository.save(orderCart);
                            totalAmount += Number(orderCart.lineTotal);
                        }
                        // Update the order total amount
                        await this.orderRepository.update(savedOrder.id, { totalAmount });
                        // Update the invoice total amount
                        invoiceData.totalAmount = totalAmount;
                    }
                }
                // Create the invoice
                const invoice = this.invoiceRepository.create(invoiceData);
                const savedInvoice = await this.invoiceRepository.save(invoice);
                // Create ledger entries for the invoice if it's issued
                if (savedInvoice.status === Invoice_1.InvoiceStatus.ISSUED) {
                    await this.ledgerService.createInvoiceEntries(savedInvoice.sellerId, savedInvoice.id, Number(savedInvoice.totalAmount), `#${savedInvoice.id} for order ${savedInvoice.orderId}`);
                }
                // Commit the transaction
                await queryRunner.commitTransaction();
                return this.findById(savedInvoice.id, savedInvoice.sellerId);
            }
            catch (error) {
                // Rollback the transaction in case of error
                await queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                // Release the query runner
                await queryRunner.release();
            }
        };
        this.update = async (id, sellerId, invoiceData, orderCarts) => {
            // Start a transaction to ensure data consistency
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                // First verify this invoice belongs to the seller
                const invoice = await this.invoiceRepository.findOneBy({ id, sellerId });
                if (!invoice) {
                    throw new Error('Invoice not found');
                }
                // Check if we're trying to edit an issued invoice
                if (invoice.status === Invoice_1.InvoiceStatus.ISSUED && invoiceData.status !== Invoice_1.InvoiceStatus.PAID) {
                    throw new Error('Cannot modify an issued invoice except to mark it as paid');
                }
                // If orderCarts are provided, update them
                if (orderCarts) {
                    // Validate orderCarts
                    if (!Array.isArray(orderCarts) || orderCarts.length === 0) {
                        throw new Error('orderCarts must be a non-empty array');
                    }
                    for (const cartItem of orderCarts) {
                        if (typeof cartItem.quantity !== 'number' || typeof cartItem.unitPrice !== 'number') {
                            throw new Error('Each orderCart must have quantity and unitPrice');
                        }
                        // If no productId, require name, sku, description
                        if (!cartItem.productId && (!cartItem.name)) {
                            throw new Error('Each custom orderCart (without productId) must have name');
                        }
                    }
                    // Get the order
                    if (!invoice.orderId) {
                        throw new Error('Invoice does not have an associated order');
                    }
                    // Delete existing carts
                    await this.orderCartRepository.delete({ orderId: invoice.orderId });
                    // Insert new carts and recalculate total
                    let totalAmount = 0;
                    for (const cartItem of orderCarts) {
                        let orderCartData = {
                            orderId: invoice.orderId,
                            sellerId: sellerId,
                            quantity: cartItem.quantity,
                            unitPrice: cartItem.unitPrice,
                            lineTotal: Number(cartItem.quantity) * Number(cartItem.unitPrice),
                            taxRate: cartItem.taxRate || 0
                        };
                        // If productId is provided, get product details
                        if (cartItem.productId) {
                            const product = await this.productRepository.findOne({
                                where: { id: cartItem.productId, sellerId: sellerId },
                                relations: ['taxCode']
                            });
                            if (product) {
                                orderCartData = {
                                    ...orderCartData,
                                    productId: product.id,
                                    sku: product.sku,
                                    name: product.name,
                                    description: cartItem.description || product.description,
                                    taxCodeId: product.taxCodeId,
                                    taxRate: product.taxCode?.rate || cartItem.taxRate || 0
                                };
                            }
                            else {
                                throw new Error(`Product with ID ${cartItem.productId} not found`);
                            }
                        }
                        else {
                            // If no productId, use the provided cart data directly
                            orderCartData = {
                                ...orderCartData,
                                sku: cartItem.sku || 'CUSTOM-ITEM',
                                name: cartItem.name,
                                description: cartItem.description || '',
                                taxCodeId: cartItem.taxCodeId,
                            };
                        }
                        const orderCart = this.orderCartRepository.create(orderCartData);
                        await this.orderCartRepository.save(orderCart);
                        totalAmount += Number(orderCart.lineTotal);
                    }
                    // Update order and invoice totals
                    await this.orderRepository.update(invoice.orderId, { totalAmount });
                    invoiceData.totalAmount = totalAmount;
                }
                // Update the invoice
                await this.invoiceRepository.update(id, invoiceData);
                const updatedInvoice = await this.invoiceRepository.findOneBy({ id, sellerId });
                if (!updatedInvoice) {
                    throw new Error('Invoice not found after update');
                }
                // If status changed to ISSUED, create ledger entries
                if (invoice.status === Invoice_1.InvoiceStatus.DRAFT && updatedInvoice.status === Invoice_1.InvoiceStatus.ISSUED) {
                    await this.ledgerService.createInvoiceEntries(updatedInvoice.sellerId, updatedInvoice.id, Number(updatedInvoice.totalAmount), `#${updatedInvoice.id} for order ${updatedInvoice.orderId}`);
                }
                // If status changed to PAID, create payment ledger entries
                if (invoice.status !== Invoice_1.InvoiceStatus.PAID && updatedInvoice.status === Invoice_1.InvoiceStatus.PAID) {
                    await this.ledgerService.createPaymentEntries(updatedInvoice.sellerId, updatedInvoice.id, Number(updatedInvoice.totalAmount), `Payment for invoice #${updatedInvoice.id}`);
                }
                // Commit the transaction
                await queryRunner.commitTransaction();
                return this.findById(updatedInvoice.id, sellerId);
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        };
        this.delete = async (id, sellerId) => {
            // First verify this invoice belongs to the seller
            const invoice = await this.invoiceRepository.findOneBy({ id, sellerId });
            if (!invoice) {
                return false;
            }
            // Cannot delete an issued or paid invoice
            if (invoice.status === Invoice_1.InvoiceStatus.ISSUED || invoice.status === Invoice_1.InvoiceStatus.PAID) {
                throw new Error('Cannot delete an issued or paid invoice');
            }
            const result = await this.invoiceRepository.delete({ id, sellerId });
            return result.affected ? result.affected > 0 : false;
        };
        this.ledgerService = new ledger_service_1.LedgerService();
    }
}
exports.InvoiceService = InvoiceService;
