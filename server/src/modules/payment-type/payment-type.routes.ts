import { Router } from 'express';
import { PaymentTypeController } from './payment-type.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const paymentTypeController = new PaymentTypeController();

// Get all payment types
router.get('/', authMiddleware, paymentTypeController.getAllPaymentTypes);

// Get active payment types
router.get('/active', authMiddleware, paymentTypeController.getActivePaymentTypes);

// Get payment type by ID
router.get('/:id', authMiddleware, paymentTypeController.getPaymentTypeById);

// Create a new payment type
router.post('/', authMiddleware, paymentTypeController.createPaymentType);

// Update an existing payment type
router.put('/:id', authMiddleware, paymentTypeController.updatePaymentType);

// Delete a payment type
router.delete('/:id', authMiddleware, paymentTypeController.deletePaymentType);

export default router; 