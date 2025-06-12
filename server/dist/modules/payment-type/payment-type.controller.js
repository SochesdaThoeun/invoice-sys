"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentTypeController = void 0;
const payment_type_service_1 = require("./payment-type.service");
class PaymentTypeController {
    constructor() {
        this.paymentTypeService = new payment_type_service_1.PaymentTypeService();
        /**
         * Get all payment types
         */
        this.getAllPaymentTypes = async (req, res) => {
            try {
                const paymentTypes = await this.paymentTypeService.getAllPaymentTypes();
                res.status(200).json(paymentTypes);
            }
            catch (error) {
                console.error('Error fetching payment types:', error);
                res.status(500).json({ message: 'Failed to fetch payment types', error });
            }
        };
        /**
         * Get payment type by ID
         */
        this.getPaymentTypeById = async (req, res) => {
            try {
                const { id } = req.params;
                const paymentType = await this.paymentTypeService.getPaymentTypeById(id);
                if (!paymentType) {
                    res.status(404).json({ message: 'Payment type not found' });
                    return;
                }
                res.status(200).json(paymentType);
            }
            catch (error) {
                console.error('Error fetching payment type:', error);
                res.status(500).json({ message: 'Failed to fetch payment type', error });
            }
        };
        /**
         * Create a new payment type
         */
        this.createPaymentType = async (req, res) => {
            try {
                const paymentTypeData = req.body;
                const newPaymentType = await this.paymentTypeService.createPaymentType(paymentTypeData);
                res.status(201).json(newPaymentType);
            }
            catch (error) {
                console.error('Error creating payment type:', error);
                res.status(500).json({ message: 'Failed to create payment type', error });
            }
        };
        /**
         * Update an existing payment type
         */
        this.updatePaymentType = async (req, res) => {
            try {
                const { id } = req.params;
                const paymentTypeData = req.body;
                const updatedPaymentType = await this.paymentTypeService.updatePaymentType(id, paymentTypeData);
                if (!updatedPaymentType) {
                    res.status(404).json({ message: 'Payment type not found' });
                    return;
                }
                res.status(200).json(updatedPaymentType);
            }
            catch (error) {
                console.error('Error updating payment type:', error);
                res.status(500).json({ message: 'Failed to update payment type', error });
            }
        };
        /**
         * Delete a payment type
         */
        this.deletePaymentType = async (req, res) => {
            try {
                const { id } = req.params;
                const success = await this.paymentTypeService.deletePaymentType(id);
                if (!success) {
                    res.status(404).json({ message: 'Payment type not found' });
                    return;
                }
                res.status(204).send();
            }
            catch (error) {
                console.error('Error deleting payment type:', error);
                res.status(500).json({ message: 'Failed to delete payment type', error });
            }
        };
        /**
         * Get active payment types
         */
        this.getActivePaymentTypes = async (req, res) => {
            try {
                const paymentTypes = await this.paymentTypeService.getActivePaymentTypes();
                res.status(200).json(paymentTypes);
            }
            catch (error) {
                console.error('Error fetching active payment types:', error);
                res.status(500).json({ message: 'Failed to fetch active payment types', error });
            }
        };
    }
}
exports.PaymentTypeController = PaymentTypeController;
