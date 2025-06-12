"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const orderController = new order_controller_1.OrderController();
// Get all orders
router.get('/', auth_middleware_1.authMiddleware, orderController.getAllOrders);
// Get order by ID
router.get('/:id', auth_middleware_1.authMiddleware, orderController.getOrderById);
// Create new order
router.post('/', auth_middleware_1.authMiddleware, orderController.createOrder);
// Create order from quote
router.post('/from-quote', auth_middleware_1.authMiddleware, orderController.createFromQuote);
// Update order
router.put('/:id', auth_middleware_1.authMiddleware, orderController.updateOrder);
// Delete order
router.delete('/:id', auth_middleware_1.authMiddleware, orderController.deleteOrder);
// Convert order to invoice
router.post('/:id/convert-to-invoice', auth_middleware_1.authMiddleware, orderController.convertToInvoice);
exports.default = router;
