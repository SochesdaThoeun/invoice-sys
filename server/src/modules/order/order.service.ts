import { AppDataSource } from '../../data-source';
import { Order } from '../../entities/Order';
import { Quote } from '../../entities/Quote';
import { Invoice, InvoiceStatus } from '../../entities/Invoice';
import { OrderCart } from '../../entities/OrderCart';
import { LedgerService } from '../ledger/ledger.service';

export class OrderService {
  private orderRepository = AppDataSource.getRepository(Order);
  private quoteRepository = AppDataSource.getRepository(Quote);
  private invoiceRepository = AppDataSource.getRepository(Invoice);
  private orderCartRepository = AppDataSource.getRepository(OrderCart);
  private ledgerService: LedgerService;

  constructor() {
    this.ledgerService = new LedgerService();
  }

  public findAll = async (sellerId: string): Promise<Order[]> => {
    return this.orderRepository.find({
      where: { sellerId },
      relations: ['customer', 'quote', 'invoice', 'orderCarts', 'paymentType'],
    });
  };

  public findById = async (id: string, sellerId: string): Promise<Order | null> => {
    return this.orderRepository.findOne({
      where: { id, sellerId },
      relations: ['customer', 'quote', 'invoice', 'orderCarts', 'paymentType'],
    });
  };

  public create = async (
    orderData: Partial<Order>,
    orderCarts?: Partial<OrderCart>[],
    createQuote: boolean = true,
    createInvoice: boolean = true
  ): Promise<Order> => {
    // Start a transaction to ensure data consistency
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the order
      const order = this.orderRepository.create(orderData);
      const savedOrder = await this.orderRepository.save(order);

      // Create order cart items if provided
      if (orderCarts && orderCarts.length > 0) {
        let totalAmount = 0;
        
        for (const cartItem of orderCarts) {
          const orderCart = this.orderCartRepository.create({
            ...cartItem,
            orderId: savedOrder.id,
            lineTotal: Number(cartItem.quantity) * Number(cartItem.unitPrice),
          });
          await this.orderCartRepository.save(orderCart);
          totalAmount += Number(orderCart.lineTotal);
        }

        // Update the order total amount if it's different from the calculated total
        if (totalAmount !== Number(savedOrder.totalAmount)) {
          await this.orderRepository.update(savedOrder.id, { totalAmount });
          savedOrder.totalAmount = totalAmount;
        }
      }

      // Create a quote for this order if requested
      if (createQuote) {
        const quote = this.quoteRepository.create({
          sellerId: savedOrder.sellerId,
          customerId: savedOrder.customerId,
          orderId: savedOrder.id,
          totalEstimate: savedOrder.totalAmount,
          status: 'ACCEPTED' // Quote is automatically accepted since it's created from an order
        });
        await this.quoteRepository.save(quote);
      }

      // Create an invoice for this order if requested
      if (createInvoice) {
        const invoice = this.invoiceRepository.create({
          sellerId: savedOrder.sellerId,
          customerId: savedOrder.customerId,
          orderId: savedOrder.id,
          totalAmount: savedOrder.totalAmount,
          status: InvoiceStatus.DRAFT
        });
        await this.invoiceRepository.save(invoice);
      }

      // Create ledger entries for the order
      await this.ledgerService.createOrderEntries(
        savedOrder.sellerId,
        savedOrder.id,
        Number(savedOrder.totalAmount),
        `#${savedOrder.id} for customer ${savedOrder.customerId}`
      );

      await queryRunner.commitTransaction();
      return this.findById(savedOrder.id, savedOrder.sellerId as string) as Promise<Order>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  };

  public createFromQuote = async (
    quoteId: string,
    sellerId: string,
    orderData: { totalAmount: number },
    orderCarts?: Partial<OrderCart>[],
    createInvoice: boolean = true
  ): Promise<Order> => {
    // Start a transaction to ensure data consistency
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the quote and verify it belongs to the seller
      const quote = await this.quoteRepository.findOne({
        where: { id: quoteId, sellerId },
        relations: ['customer'],
      });

      if (!quote) {
        throw new Error('Quote not found');
      }

      // Validate quote status is acceptable for conversion
      if (quote.status !== 'ACCEPTED' && quote.status !== 'SENT') {
        throw new Error('Quote must be in ACCEPTED or SENT status to convert to an order');
      }

      // Check if quote is already associated with an order
      if (quote.orderId) {
        throw new Error('Quote is already associated with an order');
      }

      // Create the order
      const order = this.orderRepository.create({
        sellerId,
        customerId: quote.customerId,
        totalAmount: orderData.totalAmount,
      });

      // Save the order
      const savedOrder = await this.orderRepository.save(order);

      // Update the quote with the orderId and change status to ACCEPTED if it was SENT
      await this.quoteRepository.update(quoteId, { 
        orderId: savedOrder.id, 
        status: 'ACCEPTED' 
      });

      // Create order cart items if provided
      if (orderCarts && orderCarts.length > 0) {
        let totalAmount = 0;
        
        for (const cartItem of orderCarts) {
          const orderCart = this.orderCartRepository.create({
            ...cartItem,
            orderId: savedOrder.id,
            lineTotal: Number(cartItem.quantity) * Number(cartItem.unitPrice),
          });
          await this.orderCartRepository.save(orderCart);
          totalAmount += Number(orderCart.lineTotal);
        }

        // Update the order total amount if it's different from the calculated total
        if (totalAmount !== Number(savedOrder.totalAmount)) {
          await this.orderRepository.update(savedOrder.id, { totalAmount });
          savedOrder.totalAmount = totalAmount;
        }
      }

      // Create an invoice for this order if requested
      if (createInvoice) {
        const invoice = this.invoiceRepository.create({
          sellerId: savedOrder.sellerId,
          customerId: savedOrder.customerId,
          orderId: savedOrder.id,
          totalAmount: savedOrder.totalAmount,
          status: InvoiceStatus.DRAFT
        });
        await this.invoiceRepository.save(invoice);
      }

      // Create ledger entries for the order
      await this.ledgerService.createOrderEntries(
        savedOrder.sellerId,
        savedOrder.id,
        Number(savedOrder.totalAmount),
        `#${savedOrder.id} from quote ${quote.id}`
      );

      // Commit the transaction
      await queryRunner.commitTransaction();

      return this.findById(savedOrder.id, sellerId) as Promise<Order>;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  };

  public update = async (
    id: string,
    sellerId: string,
    orderData: Partial<Order>,
    orderCarts?: Partial<OrderCart>[]
  ): Promise<Order> => {
    // Start a transaction to ensure data consistency
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First verify this order belongs to the seller
      const order = await this.orderRepository.findOne({
        where: { id, sellerId },
        relations: ['orderCarts', 'quote', 'invoice']
      });
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Update the order
      await this.orderRepository.update(id, orderData);
      
      // Update or create order cart items if provided
      if (orderCarts && orderCarts.length > 0) {
        // Remove existing order carts
        if (order.orderCarts && order.orderCarts.length > 0) {
          await this.orderCartRepository.remove(order.orderCarts);
        }

        // Create new order carts
        let totalAmount = 0;
        
        for (const cartItem of orderCarts) {
          const orderCart = this.orderCartRepository.create({
            ...cartItem,
            orderId: id,
            lineTotal: Number(cartItem.quantity) * Number(cartItem.unitPrice),
          });
          await this.orderCartRepository.save(orderCart);
          totalAmount += Number(orderCart.lineTotal);
        }

        // Update the order total amount based on the new carts
        await this.orderRepository.update(id, { totalAmount });
        
        // Update the quote if it exists
        if (order.quote) {
          await this.quoteRepository.update(order.quote.id, { totalEstimate: totalAmount });
        }
        
        // Update the invoice if it exists
        if (order.invoice && order.invoice.status === InvoiceStatus.DRAFT) {
          await this.invoiceRepository.update(order.invoice.id, { totalAmount });
        }
      }
      
      // Fetch the updated order with relations
      const updatedOrder = await this.findById(id, sellerId);
      if (!updatedOrder) {
        throw new Error('Order not found after update');
      }
      
      await queryRunner.commitTransaction();
      return updatedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  };

  public delete = async (id: string, sellerId: string): Promise<boolean> => {
    // First verify this order belongs to the seller and load its relations
    const order = await this.orderRepository.findOne({
      where: { id, sellerId },
      relations: ['quote', 'invoice']
    });
    
    if (!order) {
      return false;
    }
    
    // Cannot delete if the invoice is issued
    if (order.invoice && order.invoice.status === InvoiceStatus.ISSUED) {
      throw new Error('Cannot delete an order with an issued invoice');
    }
    
    const result = await this.orderRepository.delete({ id, sellerId });
    return result.affected ? result.affected > 0 : false;
  };

  public convertToInvoice = async (
    id: string,
    sellerId: string,
    invoiceData: { language?: string; governmentTemplate?: string }
  ): Promise<Invoice> => {
    // Start a transaction to ensure data consistency
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the order and verify it belongs to the seller
      const order = await this.orderRepository.findOne({
        where: { id, sellerId },
        relations: ['customer', 'invoice'],
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if the order already has an invoice
      if (order.invoice) {
        throw new Error('Order already has an associated invoice');
      }

      // Create the invoice
      const invoice = this.invoiceRepository.create({
        sellerId,
        customerId: order.customerId,
        orderId: order.id,
        totalAmount: order.totalAmount,
        language: invoiceData.language,
        governmentTemplate: invoiceData.governmentTemplate,
        status: InvoiceStatus.DRAFT,
      });

      // Save the invoice
      const savedInvoice = await this.invoiceRepository.save(invoice);

      // Create ledger entries for the invoice if it's not a draft
      if (savedInvoice.status === InvoiceStatus.ISSUED) {
        await this.ledgerService.createInvoiceEntries(
          savedInvoice.sellerId,
          savedInvoice.id,
          Number(savedInvoice.totalAmount),
          `#${savedInvoice.id} from order ${order.id}`
        );
      }

      // Commit the transaction
      await queryRunner.commitTransaction();

      return savedInvoice;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  };
} 