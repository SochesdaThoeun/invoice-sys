import { AppDataSource } from '../../data-source';
import { PaymentType } from '../../entities/PaymentType';

export class PaymentTypeService {
  private paymentTypeRepository = AppDataSource.getRepository(PaymentType);

  /**
   * Get all payment types
   */
  public getAllPaymentTypes = async (): Promise<PaymentType[]> => {
    return this.paymentTypeRepository.find();
  };

  /**
   * Get payment type by ID
   */
  public getPaymentTypeById = async (id: string): Promise<PaymentType | null> => {
    return this.paymentTypeRepository.findOneBy({ id });
  };

  /**
   * Create a new payment type
   */
  public createPaymentType = async (paymentTypeData: Partial<PaymentType>): Promise<PaymentType> => {
    const paymentType = this.paymentTypeRepository.create(paymentTypeData);
    return this.paymentTypeRepository.save(paymentType);
  };

  /**
   * Update an existing payment type
   */
  public updatePaymentType = async (id: string, paymentTypeData: Partial<PaymentType>): Promise<PaymentType | null> => {
    await this.paymentTypeRepository.update(id, paymentTypeData);
    return this.getPaymentTypeById(id);
  };

  /**
   * Delete a payment type
   */
  public deletePaymentType = async (id: string): Promise<boolean> => {
    const result = await this.paymentTypeRepository.delete(id);
    return result.affected !== 0;
  };

  /**
   * Get active payment types
   */
  public getActivePaymentTypes = async (): Promise<PaymentType[]> => {
    return this.paymentTypeRepository.findBy({ isActive: true });
  };
} 