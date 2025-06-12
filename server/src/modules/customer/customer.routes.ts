import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const customerController = new CustomerController();

// Get all customers
router.get('/', authMiddleware, customerController.getAllCustomers);

// Get customer by ID
router.get('/:id', authMiddleware, customerController.getCustomerById);

// Get customer by email
router.get('/email/:email', authMiddleware, customerController.getCustomerByEmail);

// Create new customer
router.post('/', authMiddleware, customerController.createCustomer);

// Update customer
router.put('/:id', authMiddleware, customerController.updateCustomer);

// Delete customer
router.delete('/:id', authMiddleware, customerController.deleteCustomer);

export default router; 