"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentTypeService = void 0;
const data_source_1 = require("../../data-source");
const PaymentType_1 = require("../../entities/PaymentType");
class PaymentTypeService {
    constructor() {
        this.paymentTypeRepository = data_source_1.AppDataSource.getRepository(PaymentType_1.PaymentType);
        /**
         * Get all payment types
         */
        this.getAllPaymentTypes = async () => {
            return this.paymentTypeRepository.find();
        };
        /**
         * Get payment type by ID
         */
        this.getPaymentTypeById = async (id) => {
            return this.paymentTypeRepository.findOneBy({ id });
        };
        /**
         * Create a new payment type
         */
        this.createPaymentType = async (paymentTypeData) => {
            const paymentType = this.paymentTypeRepository.create(paymentTypeData);
            return this.paymentTypeRepository.save(paymentType);
        };
        /**
         * Update an existing payment type
         */
        this.updatePaymentType = async (id, paymentTypeData) => {
            await this.paymentTypeRepository.update(id, paymentTypeData);
            return this.getPaymentTypeById(id);
        };
        /**
         * Delete a payment type
         */
        this.deletePaymentType = async (id) => {
            const result = await this.paymentTypeRepository.delete(id);
            return result.affected !== 0;
        };
        /**
         * Get active payment types
         */
        this.getActivePaymentTypes = async () => {
            return this.paymentTypeRepository.findBy({ isActive: true });
        };
    }
}
exports.PaymentTypeService = PaymentTypeService;
