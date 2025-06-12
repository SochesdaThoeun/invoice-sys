import { AppDataSource } from '../../data-source';
import { Category, CategoryType } from '../../entities/Category';

export class CategoryService {
  private categoryRepository = AppDataSource.getRepository(Category);

  /**
   * Get all categories for a seller
   */
  public getAllCategories = async (sellerId: string): Promise<Category[]> => {
    return this.categoryRepository.find({
      where: { sellerId },
      order: { type: 'ASC', name: 'ASC' }
    });
  };

  /**
   * Get categories by type for a seller
   */
  public getCategoriesByType = async (sellerId: string, type: CategoryType): Promise<Category[]> => {
    return this.categoryRepository.find({
      where: { sellerId, type },
      order: { name: 'ASC' }
    });
  };

  /**
   * Get category by ID for a seller
   */
  public getCategoryById = async (sellerId: string, id: string): Promise<Category | null> => {
    return this.categoryRepository.findOneBy({ sellerId, id });
  };

  /**
   * Create a new category for a seller
   */
  public createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
    const category = this.categoryRepository.create(categoryData);
    return this.categoryRepository.save(category);
  };

  /**
   * Update an existing category for a seller
   */
  public updateCategory = async (
    sellerId: string,
    id: string,
    categoryData: Partial<Category>
  ): Promise<Category | null> => {
    await this.categoryRepository.update({ sellerId, id }, categoryData);
    return this.getCategoryById(sellerId, id);
  };

  /**
   * Delete a category for a seller
   */
  public deleteCategory = async (sellerId: string, id: string): Promise<boolean> => {
    const result = await this.categoryRepository.delete({ sellerId, id });
    return result.affected !== 0;
  };

  /**
   * Find a category by name and type, or create it if it doesn't exist
   */
  public findOrCreateCategory = async (
    sellerId: string, 
    type: CategoryType, 
    name: string
  ): Promise<Category> => {
    const existingCategory = await this.categoryRepository.findOne({
      where: { sellerId, type, name }
    });

    if (existingCategory) {
      return existingCategory;
    }

    const newCategory = this.categoryRepository.create({
      sellerId,
      type,
      name
    });

    return this.categoryRepository.save(newCategory);
  };
} 