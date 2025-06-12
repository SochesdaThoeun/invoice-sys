import { AppDataSource } from '../../data-source';
import { BusinessAddress } from '../../entities/BusinessAddress';
import { Customer } from '../../entities/Customer';

export class BusinessAddressService {
  private businessAddressRepository = AppDataSource.getRepository(BusinessAddress);
  private customerRepository = AppDataSource.getRepository(Customer);

  async create(sellerId: string, data: Partial<BusinessAddress>): Promise<BusinessAddress> {
    const businessAddress = this.businessAddressRepository.create({
      ...data,
      sellerId,
      businessId: sellerId,
    });
    return this.businessAddressRepository.save(businessAddress);
  }

  async findAllForSeller(sellerId: string): Promise<BusinessAddress[]> {
    // Get addresses that belong to the seller but are NOT associated with any customer
    const query = this.businessAddressRepository
      .createQueryBuilder('businessAddress')
      .leftJoin('customers', 'customer', 'customer.businessAddressId = businessAddress.id')
      .where('businessAddress.sellerId = :sellerId', { sellerId })
      .andWhere('businessAddress.businessId = :businessId', { businessId: sellerId })
      .andWhere('customer.businessAddressId IS NULL') // Exclude addresses linked to customers
      .orderBy('businessAddress.createdAt', 'DESC');

    return query.getMany();
  }

  async findOne(sellerId: string, id: string): Promise<BusinessAddress | null> {
    return this.businessAddressRepository.findOne({
      where: { id, sellerId },
    });
  }

  async update(sellerId: string, id: string, data: Partial<BusinessAddress>): Promise<BusinessAddress | null> {
    const businessAddress = await this.findOne(sellerId, id);
    if (!businessAddress) {
      return null;
    }

    Object.assign(businessAddress, data);
    return this.businessAddressRepository.save(businessAddress);
  }

  async remove(sellerId: string, id: string): Promise<void> {
    // Check if the address is associated with any customers
    const customer = await this.customerRepository.findOne({
      where: { businessAddressId: id, sellerId },
    });

    if (customer) {
      throw new Error('Cannot delete address that is associated with a customer');
    }

    await this.businessAddressRepository.delete({ id, sellerId });
  }
} 