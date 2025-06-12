"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessAddressService = void 0;
const data_source_1 = require("../../data-source");
const BusinessAddress_1 = require("../../entities/BusinessAddress");
const Customer_1 = require("../../entities/Customer");
class BusinessAddressService {
    constructor() {
        this.businessAddressRepository = data_source_1.AppDataSource.getRepository(BusinessAddress_1.BusinessAddress);
        this.customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
    }
    async create(sellerId, data) {
        const businessAddress = this.businessAddressRepository.create({
            ...data,
            sellerId,
            businessId: sellerId,
        });
        return this.businessAddressRepository.save(businessAddress);
    }
    async findAllForSeller(sellerId) {
        // Get addresses that belong to the seller but are NOT associated with any customer
        const query = this.businessAddressRepository
            .createQueryBuilder('businessAddress')
            .leftJoin('customers', 'customer', 'customer.businessAddressId = businessAddress.id')
            .where('businessAddress.sellerId = :sellerId', { sellerId })
            .andWhere('businessAddress.businessId = :businessId', { businessId: sellerId })
            .andWhere('customer.businessAddressId IS NULL') // Exclude addresses linked to customers
            .orderBy('businessAddress.createdAt', 'DESC');
        return query.getMany();
    }
    async findOne(sellerId, id) {
        return this.businessAddressRepository.findOne({
            where: { id, sellerId },
        });
    }
    async update(sellerId, id, data) {
        const businessAddress = await this.findOne(sellerId, id);
        if (!businessAddress) {
            return null;
        }
        Object.assign(businessAddress, data);
        return this.businessAddressRepository.save(businessAddress);
    }
    async remove(sellerId, id) {
        // Check if the address is associated with any customers
        const customer = await this.customerRepository.findOne({
            where: { businessAddressId: id, sellerId },
        });
        if (customer) {
            throw new Error('Cannot delete address that is associated with a customer');
        }
        await this.businessAddressRepository.delete({ id, sellerId });
    }
}
exports.BusinessAddressService = BusinessAddressService;
