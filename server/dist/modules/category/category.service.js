"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const data_source_1 = require("../../data-source");
const Category_1 = require("../../entities/Category");
class CategoryService {
    constructor() {
        this.categoryRepository = data_source_1.AppDataSource.getRepository(Category_1.Category);
        /**
         * Get all categories for a seller
         */
        this.getAllCategories = async (sellerId) => {
            return this.categoryRepository.find({
                where: { sellerId },
                order: { type: 'ASC', name: 'ASC' }
            });
        };
        /**
         * Get categories by type for a seller
         */
        this.getCategoriesByType = async (sellerId, type) => {
            return this.categoryRepository.find({
                where: { sellerId, type },
                order: { name: 'ASC' }
            });
        };
        /**
         * Get category by ID for a seller
         */
        this.getCategoryById = async (sellerId, id) => {
            return this.categoryRepository.findOneBy({ sellerId, id });
        };
        /**
         * Create a new category for a seller
         */
        this.createCategory = async (categoryData) => {
            const category = this.categoryRepository.create(categoryData);
            return this.categoryRepository.save(category);
        };
        /**
         * Update an existing category for a seller
         */
        this.updateCategory = async (sellerId, id, categoryData) => {
            await this.categoryRepository.update({ sellerId, id }, categoryData);
            return this.getCategoryById(sellerId, id);
        };
        /**
         * Delete a category for a seller
         */
        this.deleteCategory = async (sellerId, id) => {
            const result = await this.categoryRepository.delete({ sellerId, id });
            return result.affected !== 0;
        };
        /**
         * Find a category by name and type, or create it if it doesn't exist
         */
        this.findOrCreateCategory = async (sellerId, type, name) => {
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
}
exports.CategoryService = CategoryService;
