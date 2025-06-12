"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const customer_service_1 = require("./customer.service");
class CustomerController {
    constructor() {
        this.getAllCustomers = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const page = req.query.page ? parseInt(req.query.page) : 1;
                const limit = req.query.limit ? parseInt(req.query.limit) : 10;
                const customers = await this.customerService.findAll(sellerId, page, limit);
                res.status(200).json(customers);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to get customers', error });
            }
        };
        this.getCustomerById = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const customer = await this.customerService.findById(req.params.id, sellerId);
                if (!customer) {
                    res.status(404).json({ message: 'Customer not found' });
                    return;
                }
                res.status(200).json(customer);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to get customer', error });
            }
        };
        this.getCustomerByEmail = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const customer = await this.customerService.findByEmail(req.params.email, sellerId);
                if (!customer) {
                    res.status(404).json({ message: 'Customer not found' });
                    return;
                }
                res.status(200).json(customer);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to get customer by email', error });
            }
        };
        this.createCustomer = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const { name, email, phone, businessRegistrationNumber, businessName, businessAddress } = req.body;
                const customer = await this.customerService.create({
                    sellerId,
                    name,
                    email,
                    phone,
                    businessRegistrationNumber,
                    businessName
                }, businessAddress);
                res.status(201).json(customer);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to create customer', error });
            }
        };
        this.updateCustomer = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const { name, email, phone, businessRegistrationNumber, businessName, businessAddress } = req.body;
                const updatedCustomer = await this.customerService.update(req.params.id, sellerId, {
                    name,
                    email,
                    phone,
                    businessRegistrationNumber,
                    businessName
                }, businessAddress);
                res.status(200).json(updatedCustomer);
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to update customer', error });
            }
        };
        this.deleteCustomer = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const success = await this.customerService.delete(req.params.id, sellerId);
                if (!success) {
                    res.status(404).json({ message: 'Customer not found or could not be deleted' });
                    return;
                }
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ message: 'Failed to delete customer', error });
            }
        };
        this.customerService = new customer_service_1.CustomerService();
    }
}
exports.CustomerController = CustomerController;
