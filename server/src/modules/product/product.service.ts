import { AppDataSource } from '../../data-source';
import { Product } from '../../entities/Product';

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProductService {
  private productRepository = AppDataSource.getRepository(Product);

  public findAll = async (
    sellerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Product>> => {
    const [items, total] = await this.productRepository.findAndCount({
      where: { sellerId },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  };

  public findById = async (id: string, sellerId: string): Promise<Product | null> => {
    return this.productRepository.findOneBy({ id, sellerId });
  };

  public findBySku = async (sku: string, sellerId: string): Promise<Product | null> => {
    return this.productRepository.findOneBy({ sku, sellerId });
  };

  public create = async (productData: Partial<Product>): Promise<Product> => {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  };

  public update = async (
    id: string,
    sellerId: string,
    productData: Partial<Product>
  ): Promise<Product> => {
    // First verify this product belongs to the seller
    const product = await this.productRepository.findOneBy({ id, sellerId });
    if (!product) {
      throw new Error('Product not found');
    }
    
    await this.productRepository.update(id, productData);
    
    const updatedProduct = await this.productRepository.findOneBy({ id, sellerId });
    if (!updatedProduct) {
      throw new Error('Product not found after update');
    }
    
    return updatedProduct;
  };

  public delete = async (id: string, sellerId: string): Promise<boolean> => {
    // First verify this product belongs to the seller
    const product = await this.productRepository.findOneBy({ id, sellerId });
    if (!product) {
      return false;
    }
    
    const result = await this.productRepository.delete({ id, sellerId });
    return result.affected ? result.affected > 0 : false;
  };
} 