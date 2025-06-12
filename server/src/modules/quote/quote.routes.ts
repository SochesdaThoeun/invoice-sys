import { Router } from 'express';
import { QuoteController } from './quote.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const quoteController = new QuoteController();

// Get all quotes
router.get('/', authMiddleware, quoteController.getAllQuotes);

// Get quote by ID
router.get('/:id', authMiddleware, quoteController.getQuoteById);

// Create new quote
router.post('/', authMiddleware, quoteController.createQuote);

// Update quote
router.put('/:id', authMiddleware, quoteController.updateQuote);

// Delete quote
router.delete('/:id', authMiddleware, quoteController.deleteQuote);



export default router; 