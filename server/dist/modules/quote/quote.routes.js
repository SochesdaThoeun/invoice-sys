"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quote_controller_1 = require("./quote.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const quoteController = new quote_controller_1.QuoteController();
// Get all quotes
router.get('/', auth_middleware_1.authMiddleware, quoteController.getAllQuotes);
// Get quote by ID
router.get('/:id', auth_middleware_1.authMiddleware, quoteController.getQuoteById);
// Create new quote
router.post('/', auth_middleware_1.authMiddleware, quoteController.createQuote);
// Update quote
router.put('/:id', auth_middleware_1.authMiddleware, quoteController.updateQuote);
// Delete quote
router.delete('/:id', auth_middleware_1.authMiddleware, quoteController.deleteQuote);
exports.default = router;
