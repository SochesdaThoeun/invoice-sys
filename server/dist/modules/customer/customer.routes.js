"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("./customer.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const customerController = new customer_controller_1.CustomerController();
// Get all customers
router.get('/', auth_middleware_1.authMiddleware, customerController.getAllCustomers);
// Get customer by ID
router.get('/:id', auth_middleware_1.authMiddleware, customerController.getCustomerById);
// Get customer by email
router.get('/email/:email', auth_middleware_1.authMiddleware, customerController.getCustomerByEmail);
// Create new customer
router.post('/', auth_middleware_1.authMiddleware, customerController.createCustomer);
// Update customer
router.put('/:id', auth_middleware_1.authMiddleware, customerController.updateCustomer);
// Delete customer
router.delete('/:id', auth_middleware_1.authMiddleware, customerController.deleteCustomer);
exports.default = router;
