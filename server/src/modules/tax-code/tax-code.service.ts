import { AppDataSource } from '../../data-source';
import { TaxCode } from '../../entities/TaxCode';

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class TaxCodeService {
  private taxCodeRepository = AppDataSource.getRepository(TaxCode);

  public findAll = async (
    sellerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<TaxCode>> => {
    const [items, total] = await this.taxCodeRepository.findAndCount({
      where: { sellerId },
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

  public findById = async (id: string, sellerId: string): Promise<TaxCode | null> => {
    return this.taxCodeRepository.findOneBy({ id, sellerId });
  };

  public findByCountryAndRegion = async (
    countryCode: string, 
    region: string | null, 
    sellerId: string
  ): Promise<TaxCode | null> => {
    if (region) {
      return this.taxCodeRepository.findOneBy({ countryCode, region, sellerId });
    } else {
      return this.taxCodeRepository.findOneBy({ countryCode, sellerId });
    }
  };

  public create = async (taxCodeData: Partial<TaxCode>): Promise<TaxCode> => {
    const taxCode = this.taxCodeRepository.create(taxCodeData);
    return this.taxCodeRepository.save(taxCode);
  };

  public update = async (
    id: string,
    sellerId: string,
    taxCodeData: Partial<TaxCode>
  ): Promise<TaxCode> => {
    // First verify this tax code belongs to the seller
    const taxCode = await this.taxCodeRepository.findOneBy({ id, sellerId });
    if (!taxCode) {
      throw new Error('Tax code not found');
    }
    
    await this.taxCodeRepository.update(id, taxCodeData);
    
    const updatedTaxCode = await this.taxCodeRepository.findOneBy({ id, sellerId });
    if (!updatedTaxCode) {
      throw new Error('Tax code not found after update');
    }
    
    return updatedTaxCode;
  };

  public delete = async (id: string, sellerId: string): Promise<boolean> => {
    // First verify this tax code belongs to the seller
    const taxCode = await this.taxCodeRepository.findOneBy({ id, sellerId });
    if (!taxCode) {
      return false;
    }
    
    const result = await this.taxCodeRepository.delete({ id, sellerId });
    return result.affected ? result.affected > 0 : false;
  };
} 