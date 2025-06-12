import { Router } from 'express';
import { OrderController } from './order.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const orderController = new OrderController();

// Get all orders
router.get('/', authMiddleware, orderController.getAllOrders);

// Get order by ID
router.get('/:id', authMiddleware, orderController.getOrderById);

// Create new order
router.post('/', authMiddleware, orderController.createOrder);

// Create order from quote
router.post('/from-quote', authMiddleware, orderController.createFromQuote);

// Update order
router.put('/:id', authMiddleware, orderController.updateOrder);

// Delete order
router.delete('/:id', authMiddleware, orderController.deleteOrder);

// Convert order to invoice
router.post('/:id/convert-to-invoice', authMiddleware, orderController.convertToInvoice);

export default router; 