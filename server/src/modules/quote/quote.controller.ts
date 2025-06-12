import { Request, Response } from 'express';
import { QuoteService } from './quote.service';

export class QuoteController {
  private quoteService: QuoteService;

  constructor() {
    this.quoteService = new QuoteService();
  }

  public getAllQuotes = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const paginatedQuotes = await this.quoteService.findAll(sellerId, page, limit);
      
      res.status(200).json(paginatedQuotes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get quotes', error });
    }
  };

  public getQuoteById = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const quote = await this.quoteService.findById(req.params.id, sellerId);
      if (!quote) {
        res.status(404).json({ message: 'Quote not found' });
        return;
      }
      res.status(200).json(quote);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get quote', error });
    }
  };

  public createQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { customerId, totalEstimate, expiresAt, status, orderCarts, paymentTypeId } = req.body;

      // Validate required fields
      if (!customerId) {
        res.status(400).json({ message: 'customerId is required' });
        return;
      }
      // Validation for orderCarts if present
      if (orderCarts) {
        if (!Array.isArray(orderCarts) || orderCarts.length === 0) {
          res.status(400).json({ message: 'orderCarts must be a non-empty array' });
          return;
        }
        for (const cart of orderCarts) {
          if (typeof cart.quantity !== 'number' || typeof cart.unitPrice !== 'number') {
            res.status(400).json({ message: 'Each orderCart must have quantity and unitPrice' });
            return;
          }
          
          // If productId is provided, we only need productId, quantity, unitPrice
          if (cart.productId) {
            // Description is optional when productId is provided
            continue;
          } 
          
          // If no productId, require name, sku, description
          if (!cart.name) {
            res.status(400).json({ message: 'Each custom orderCart (without productId) must have name' });
            return;
          }
        }
      }

      const quote = await this.quoteService.create(
        {
          sellerId,
          customerId,
          totalEstimate,
          expiresAt,
          status: status || 'DRAFT'
        },
        orderCarts,
        paymentTypeId,
      );

      res.status(201).json(quote);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create quote';
      const status = errorMessage.includes('not found') ? 404 : errorMessage.includes('orderCart') ? 400 : 500;
      res.status(status).json({ message: errorMessage, error });
    }
  };

  public updateQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { customerId, totalEstimate, expiresAt, status, orderCarts } = req.body;

      // Validation for orderCarts if present
      if (orderCarts) {
        if (!Array.isArray(orderCarts) || orderCarts.length === 0) {
          res.status(400).json({ message: 'orderCarts must be a non-empty array' });
          return;
        }
        for (const cart of orderCarts) {
          if (typeof cart.quantity !== 'number' || typeof cart.unitPrice !== 'number') {
            res.status(400).json({ message: 'Each orderCart must have quantity and unitPrice' });
            return;
          }
          
          // If productId is provided, we only need productId, quantity, unitPrice
          if (cart.productId) {
            // Description is optional when productId is provided
            continue;
          } 
          
          // If no productId, require name, sku, description
          if (!cart.name) {
            res.status(400).json({ message: 'Each custom orderCart (without productId) must have name' });
            return;
          }
        }
      }

      const updatedQuote = await this.quoteService.update(
        req.params.id,
        sellerId,
        {
          customerId,
          totalEstimate,
          expiresAt,
          status
        },
        orderCarts
      );

      res.status(200).json(updatedQuote);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quote';
      const status = errorMessage.includes('not found') ? 404 : errorMessage.includes('orderCart') ? 400 : 500;
      res.status(status).json({ message: errorMessage, error });
    }
  };

  public deleteQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const success = await this.quoteService.delete(req.params.id, sellerId);
      if (!success) {
        res.status(404).json({ message: 'Quote not found or could not be deleted' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete quote', error });
    }
  };

} 