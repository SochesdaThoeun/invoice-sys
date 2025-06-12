import { Request, Response } from 'express';
import { OrderService } from './order.service';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  public getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const orders = await this.orderService.findAll(sellerId);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get orders', error });
    }
  };

  public getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const order = await this.orderService.findById(req.params.id, sellerId);
      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get order', error });
    }
  };

  public createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { customerId, totalAmount, orderCarts, createQuote, createInvoice } = req.body;
      
      const order = await this.orderService.create(
        {
          sellerId,
          customerId,
          totalAmount,
        },
        orderCarts,
        createQuote !== false, // Default to true if not specified
        createInvoice !== false // Default to true if not specified
      );

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create order', error });
    }
  };

  public createFromQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { quoteId, totalAmount, orderCarts, createInvoice } = req.body;
      
      const order = await this.orderService.createFromQuote(
        quoteId,
        sellerId,
        { totalAmount },
        orderCarts,
        createInvoice !== false // Default to true if not specified
      );

      res.status(201).json(order);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order from quote';
      res.status(500).json({ message: errorMessage, error });
    }
  };

  public updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { totalAmount, orderCarts } = req.body;
      
      const updatedOrder = await this.orderService.update(
        req.params.id,
        sellerId,
        {
          totalAmount,
        },
        orderCarts
      );

      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update order', error });
    }
  };

  public deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const success = await this.orderService.delete(req.params.id, sellerId);
      if (!success) {
        res.status(404).json({ message: 'Order not found or could not be deleted' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete order';
      res.status(500).json({ message: errorMessage, error });
    }
  };

  public convertToInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { language, governmentTemplate } = req.body;
      
      const invoice = await this.orderService.convertToInvoice(
        req.params.id,
        sellerId,
        { language, governmentTemplate }
      );

      res.status(201).json(invoice);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert order to invoice';
      res.status(500).json({ message: errorMessage, error });
    }
  };
} 