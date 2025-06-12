"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const data_source_1 = require("../../data-source");
const Customer_1 = require("../../entities/Customer");
const BusinessAddress_1 = require("../../entities/BusinessAddress");
class CustomerService {
    constructor() {
        this.customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        this.businessAddressRepository = data_source_1.AppDataSource.getRepository(BusinessAddress_1.BusinessAddress);
        this.findAll = async (sellerId, page = 1, limit = 10) => {
            const [items, total] = await this.customerRepository.findAndCount({
                where: { sellerId },
                relations: ['businessAddress'],
                skip: (page - 1) * limit,
                take: limit
            });
            return {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        };
        this.findById = async (id, sellerId) => {
            return this.customerRepository.findOne({
                where: { id, sellerId },
                relations: ['businessAddress']
            });
        };
        this.findByEmail = async (email, sellerId) => {
            return this.customerRepository.findOne({
                where: { email, sellerId },
                relations: ['businessAddress']
            });
        };
        this.create = async (customerData, businessAddressData) => {
            const customer = this.customerRepository.create(customerData);
            // Create business address if provided
            if (businessAddressData) {
                const businessAddress = this.businessAddressRepository.create({
                    ...businessAddressData,
                    sellerId: customerData.sellerId,
                    businessId: customerData.sellerId // Use seller ID as business ID
                });
                // Save the business address
                const savedBusinessAddress = await this.businessAddressRepository.save(businessAddress);
                // Link business address to customer
                customer.businessAddressId = savedBusinessAddress.id;
                // Save the customer
                const savedCustomer = await this.customerRepository.save(customer);
                // Fetch the complete customer with relations
                return this.customerRepository.findOne({
                    where: { id: savedCustomer.id },
                    relations: ['businessAddress']
                });
            }
            // If no business address, just save the customer
            return this.customerRepository.save(customer);
        };
        this.update = async (id, sellerId, customerData, businessAddressData) => {
            // First verify this customer belongs to the seller
            const customer = await this.customerRepository.findOne({
                where: { id, sellerId },
                relations: ['businessAddress']
            });
            if (!customer) {
                throw new Error('Customer not found');
            }
            // Update customer data
            await this.customerRepository.update(id, customerData);
            // Update or create business address if provided
            if (businessAddressData) {
                if (customer.businessAddressId) {
                    // Update existing business address
                    await this.businessAddressRepository.update(customer.businessAddressId, businessAddressData);
                }
                else {
                    // Create new business address
                    const businessAddress = this.businessAddressRepository.create({
                        ...businessAddressData,
                        sellerId,
                        businessId: sellerId // Use seller ID as business ID
                    });
                    // Save the business address
                    const savedAddress = await this.businessAddressRepository.save(businessAddress);
                    // Link to customer
                    await this.customerRepository.update(id, { businessAddressId: savedAddress.id });
                }
            }
            // Fetch updated customer with relations
            const updatedCustomer = await this.customerRepository.findOne({
                where: { id, sellerId },
                relations: ['businessAddress']
            });
            if (!updatedCustomer) {
                throw new Error('Customer not found after update');
            }
            return updatedCustomer;
        };
        this.delete = async (id, sellerId) => {
            // First verify this customer belongs to the seller
            const customer = await this.customerRepository.findOne({
                where: { id, sellerId },
                relations: ['businessAddress']
            });
            if (!customer) {
                return false;
            }
            // If the customer has a business address, delete it first
            if (customer.businessAddressId) {
                await this.businessAddressRepository.delete(customer.businessAddressId);
            }
            // Delete the customer
            const result = await this.customerRepository.delete({ id, sellerId });
            return result.affected ? result.affected > 0 : false;
        };
    }
}
exports.CustomerService = CustomerService;
