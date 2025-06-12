"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_type_controller_1 = require("./payment-type.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const paymentTypeController = new payment_type_controller_1.PaymentTypeController();
// Get all payment types
router.get('/', auth_middleware_1.authMiddleware, paymentTypeController.getAllPaymentTypes);
// Get active payment types
router.get('/active', auth_middleware_1.authMiddleware, paymentTypeController.getActivePaymentTypes);
// Get payment type by ID
router.get('/:id', auth_middleware_1.authMiddleware, paymentTypeController.getPaymentTypeById);
// Create a new payment type
router.post('/', auth_middleware_1.authMiddleware, paymentTypeController.createPaymentType);
// Update an existing payment type
router.put('/:id', auth_middleware_1.authMiddleware, paymentTypeController.updatePaymentType);
// Delete a payment type
router.delete('/:id', auth_middleware_1.authMiddleware, paymentTypeController.deletePaymentType);
exports.default = router;
