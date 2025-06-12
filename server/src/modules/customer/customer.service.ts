import { AppDataSource } from '../../data-source';
import { Customer } from '../../entities/Customer';
import { BusinessAddress } from '../../entities/BusinessAddress';

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CustomerService {
  private customerRepository = AppDataSource.getRepository(Customer);
  private businessAddressRepository = AppDataSource.getRepository(BusinessAddress);

  public findAll = async (
    sellerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Customer>> => {
    const [items, total] = await this.customerRepository.findAndCount({ 
      where: { sellerId },
      relations: ['businessAddress'],
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      items,
      total,
      page, 
      limit,
      totalPages: Math.ceil(total / limit)
    };
  };

  public findById = async (id: string, sellerId: string): Promise<Customer | null> => {
    return this.customerRepository.findOne({
      where: { id, sellerId },
      relations: ['businessAddress']
    });
  };

  public findByEmail = async (email: string, sellerId: string): Promise<Customer | null> => {
    return this.customerRepository.findOne({
      where: { email, sellerId },
      relations: ['businessAddress']
    });
  };

  public create = async (customerData: Partial<Customer>, businessAddressData?: Partial<BusinessAddress>): Promise<Customer> => {
    const customer = this.customerRepository.create(customerData);
    
    // Create business address if provided
    if (businessAddressData) {
      const businessAddress = this.businessAddressRepository.create({
        ...businessAddressData,
        sellerId: customerData.sellerId,
        businessId: customerData.sellerId // Use seller ID as business ID
      });
      
      // Save the business address
      const savedBusinessAddress = await this.businessAddressRepository.save(businessAddress);
      
      // Link business address to customer
      customer.businessAddressId = savedBusinessAddress.id;
      
      // Save the customer
      const savedCustomer = await this.customerRepository.save(customer);
      
      // Fetch the complete customer with relations
      return this.customerRepository.findOne({
        where: { id: savedCustomer.id },
        relations: ['businessAddress']
      }) as Promise<Customer>;
    }
    
    // If no business address, just save the customer
    return this.customerRepository.save(customer);
  };

  public update = async (
    id: string,
    sellerId: string,
    customerData: Partial<Customer>,
    businessAddressData?: Partial<BusinessAddress>
  ): Promise<Customer> => {
    // First verify this customer belongs to the seller
    const customer = await this.customerRepository.findOne({
      where: { id, sellerId },
      relations: ['businessAddress']
    });
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    // Update customer data
    await this.customerRepository.update(id, customerData);
    
    // Update or create business address if provided
    if (businessAddressData) {
      if (customer.businessAddressId) {
        // Update existing business address
        await this.businessAddressRepository.update(customer.businessAddressId, businessAddressData);
      } else {
        // Create new business address
        const businessAddress = this.businessAddressRepository.create({
          ...businessAddressData,
          sellerId,
          businessId: sellerId // Use seller ID as business ID
        });
        
        // Save the business address
        const savedAddress = await this.businessAddressRepository.save(businessAddress);
        
        // Link to customer
        await this.customerRepository.update(id, { businessAddressId: savedAddress.id });
      }
    }
    
    // Fetch updated customer with relations
    const updatedCustomer = await this.customerRepository.findOne({
      where: { id, sellerId },
      relations: ['businessAddress']
    });
    
    if (!updatedCustomer) {
      throw new Error('Customer not found after update');
    }
    
    return updatedCustomer;
  };

  public delete = async (id: string, sellerId: string): Promise<boolean> => {
    // First verify this customer belongs to the seller
    const customer = await this.customerRepository.findOne({
      where: { id, sellerId },
      relations: ['businessAddress']
    });
    
    if (!customer) {
      return false;
    }
    
    // If the customer has a business address, delete it first
    if (customer.businessAddressId) {
      await this.businessAddressRepository.delete(customer.businessAddressId);
    }
    
    // Delete the customer
    const result = await this.customerRepository.delete({ id, sellerId });
    return result.affected ? result.affected > 0 : false;
  };
} 