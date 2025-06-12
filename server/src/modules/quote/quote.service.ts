import { AppDataSource } from '../../data-source';
import { Quote } from '../../entities/Quote';
import { Order } from '../../entities/Order';
import { OrderCart } from '../../entities/OrderCart';
import { Customer } from '../../entities/Customer';
import { LedgerService } from '../ledger/ledger.service';
import { Product } from '../../entities/Product';

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class QuoteService {
  private quoteRepository = AppDataSource.getRepository(Quote);
  private orderRepository = AppDataSource.getRepository(Order);
  private orderCartRepository = AppDataSource.getRepository(OrderCart);
  private productRepository = AppDataSource.getRepository(Product);
  private ledgerService: LedgerService;

  constructor() {
    this.ledgerService = new LedgerService();
  }

  public findAll = async (sellerId: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Quote>> => {
    const skip = (page - 1) * limit;
    
    const [items, total] = await this.quoteRepository.findAndCount({
      where: { sellerId },
      relations: ['customer', 'order', 'order.orderCarts', 'order.paymentType'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' }
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      items,
      total,
      page,
      limit,
      totalPages
    };
  };

  public findById = async (id: string, sellerId: string): Promise<Quote | null> => {
    return this.quoteRepository.findOne({
      where: { id, sellerId },
      relations: ['customer', 'order', 'order.orderCarts', 'order.paymentType'],
    });
  };

  public create = async (
    quoteData: Partial<Quote>, 
    orderCarts?: Partial<OrderCart>[],
    paymentTypeId?: string
  ): Promise<Quote> => {
    // Start a transaction to ensure data consistency
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let savedOrder: Order | undefined;
      let totalAmount = 0;

      
        // Create the order
        const order = this.orderRepository.create({
          sellerId: quoteData.sellerId,
          customerId: quoteData.customerId,
          totalAmount: quoteData.totalEstimate || 0,
          paymentTypeId: paymentTypeId,
        });
        

        // Save the order
        savedOrder = await this.orderRepository.save(order);

        // Validate orderCarts if provided
        if (orderCarts && orderCarts.length > 0) {
          for (const cart of orderCarts) {
            if (typeof cart.quantity !== 'number' || typeof cart.unitPrice !== 'number') {
              throw new Error('Each orderCart must have quantity and unitPrice');
            }
            
            // If no productId, require name, sku, description
            if (!cart.productId && (!cart.name)) {
              throw new Error('Each custom orderCart (without productId) must have name');
            }
          }
        }

        // Create order cart items
        for (const cartItem of orderCarts || []) {
          let orderCartData: Partial<OrderCart> = {
            orderId: savedOrder.id,
            sellerId: quoteData.sellerId,
            quantity: cartItem.quantity,
            unitPrice: cartItem.unitPrice,
            lineTotal: Number(cartItem.quantity) * Number(cartItem.unitPrice),
            taxRate: cartItem.taxRate || 0
          };

          // If productId is provided, get product details
          if (cartItem.productId) {
            const product = await this.productRepository.findOne({ 
              where: { id: cartItem.productId, sellerId: quoteData.sellerId },
              relations: ['taxCode']
            });
            
            if (product) {
              orderCartData = {
                ...orderCartData,
                productId: product.id,
                sku: product.sku,
                name: product.name,
                description: cartItem.description || product.description,
                taxCodeId: product.taxCodeId,
                taxRate: product.taxCode?.rate || cartItem.taxRate || 0
              };
            } else {
              throw new Error(`Product with ID ${cartItem.productId} not found`);
            }
          } else {
            // If no productId, use the provided cart data directly
            orderCartData = {
              ...orderCartData,
              sku: cartItem.sku || 'CUSTOM-ITEM',
              name: cartItem.name,
              description: cartItem.description || '',
              taxCodeId: cartItem.taxCodeId,
            };
          }

          const orderCart = this.orderCartRepository.create(orderCartData);
          await this.orderCartRepository.save(orderCart);
          totalAmount += Number(orderCart.lineTotal);
        }

        // Update the order total amount if it differs from the quote estimate
        if (totalAmount !== Number(quoteData.totalEstimate)) {
          await this.orderRepository.update(savedOrder.id, { totalAmount });
        }

        // Set the orderId in quoteData
        quoteData.orderId = savedOrder.id;
        // Optionally update totalEstimate to match actual totalAmount
        quoteData.totalEstimate = totalAmount;
      

      // Create the quote
      const quote = this.quoteRepository.create(quoteData);
      const savedQuote = await this.quoteRepository.save(quote);

      // Create ledger entries
      if (savedQuote.status === 'SENT') {
        if (savedOrder) {
          await this.ledgerService.createOrderEntries(
            savedOrder.sellerId,
            savedOrder.id,
            Number(totalAmount),
            `#${savedOrder.id} for quote ${savedQuote.id}`
          );
        } else {
          await this.ledgerService.createQuoteEntries(
            savedQuote.sellerId,
            savedQuote.id,
            Number(savedQuote.totalEstimate),
            `#${savedQuote.id} for customer ${savedQuote.customerId}`
          );
        }
      }

      await queryRunner.commitTransaction();
      return this.findById(savedQuote.id, savedQuote.sellerId as string) as Promise<Quote>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  };

  public update = async (
    id: string,
    sellerId: string,
    quoteData: Partial<Quote>,
    orderCarts?: Partial<OrderCart>[],
    paymentTypeId?: string
  ): Promise<Quote> => {
    // Start a transaction to ensure data consistency
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First verify this quote belongs to the seller
      const quote = await this.quoteRepository.findOneBy({ id, sellerId });
      if (!quote) {
        throw new Error('Quote not found');
      }

      // If orderCarts are provided, update them
      if (orderCarts) {
        // Validate orderCarts
        if (!Array.isArray(orderCarts) || orderCarts.length === 0) {
          throw new Error('orderCarts must be a non-empty array');
        }
        for (const cart of orderCarts) {
          if (typeof cart.quantity !== 'number' || typeof cart.unitPrice !== 'number') {
            throw new Error('Each orderCart must have quantity and unitPrice');
          }
          
          // If no productId, require name, sku, description
          if (!cart.productId && (!cart.name)) {
            throw new Error('Each custom orderCart (without productId) must have name');
          }
        }
        // Get the order
        if (!quote.orderId) {
          throw new Error('Quote does not have an associated order');
        }
        // Delete existing carts
        await this.orderCartRepository.delete({ orderId: quote.orderId });
        // Insert new carts and recalculate total
        let totalAmount = 0;
        for (const cartItem of orderCarts) {
          let orderCartData: Partial<OrderCart> = {
            orderId: quote.orderId,
            sellerId: sellerId,
            quantity: cartItem.quantity,
            unitPrice: cartItem.unitPrice,
            lineTotal: Number(cartItem.quantity) * Number(cartItem.unitPrice),
            taxRate: cartItem.taxRate || 0
          };

          // If productId is provided, get product details
          if (cartItem.productId) {
            const product = await this.productRepository.findOne({ 
              where: { id: cartItem.productId, sellerId: sellerId },
              relations: ['taxCode']
            });
            
            if (product) {
              orderCartData = {
                ...orderCartData,
                productId: product.id,
                sku: product.sku,
                name: product.name,
                description: cartItem.description || product.description,
                taxCodeId: product.taxCodeId,
                taxRate: product.taxCode?.rate || cartItem.taxRate || 0
              };
            } else {
              throw new Error(`Product with ID ${cartItem.productId} not found`);
            }
          } else {
            // If no productId, use the provided cart data directly
            orderCartData = {
              ...orderCartData,
              sku: cartItem.sku || 'CUSTOM-ITEM',
              name: cartItem.name,
              description: cartItem.description || '',
              taxCodeId: cartItem.taxCodeId,
            };
          }

          const orderCart = this.orderCartRepository.create(orderCartData);
          await this.orderCartRepository.save(orderCart);
          totalAmount += Number(orderCart.lineTotal);
        }
        // Update order and quote totals
        await this.orderRepository.update(quote.orderId, { totalAmount });
        quoteData.totalEstimate = totalAmount;
      }

      // If status is changing from DRAFT to SENT, we need to create ledger entries
      const isBecomingSent = quote.status === 'DRAFT' && quoteData.status === 'SENT';
      await this.quoteRepository.update(id, quoteData);
      const updatedQuote = await this.quoteRepository.findOneBy({ id, sellerId });
      if (!updatedQuote) {
        throw new Error('Quote not found after update');
      }

      // If status changed to SENT, create ledger entries
      if (isBecomingSent) {
        if (updatedQuote.orderId) {
          await this.ledgerService.createOrderEntries(
            sellerId,
            updatedQuote.orderId,
            Number(updatedQuote.totalEstimate),
            `#${updatedQuote.orderId} for quote ${updatedQuote.id}`
          );
        } else {
          await this.ledgerService.createQuoteEntries(
            updatedQuote.sellerId,
            updatedQuote.id,
            Number(updatedQuote.totalEstimate),
            `#${updatedQuote.id} for customer ${updatedQuote.customerId}`
          );
        }
      }

      await queryRunner.commitTransaction();
      return this.findById(updatedQuote.id, sellerId) as Promise<Quote>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  };

  public delete = async (id: string, sellerId: string): Promise<boolean> => {
    // First verify this quote belongs to the seller
    const quote = await this.quoteRepository.findOneBy({ id, sellerId });
    if (!quote) {
      return false;
    }
    
    const result = await this.quoteRepository.delete({ id, sellerId });
    return result.affected ? result.affected > 0 : false;
  };

  
} 