"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("./category.service");
const Category_1 = require("../../entities/Category");
class CategoryController {
    constructor() {
        this.categoryService = new category_service_1.CategoryService();
        /**
         * Get all categories for the authenticated seller
         */
        this.getAllCategories = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const categories = await this.categoryService.getAllCategories(sellerId);
                res.status(200).json(categories);
            }
            catch (error) {
                console.error('Error fetching categories:', error);
                res.status(500).json({ message: 'Failed to fetch categories', error });
            }
        };
        /**
         * Get categories by type for the authenticated seller
         */
        this.getCategoriesByType = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const { type } = req.params;
                // Validate that the type is a valid CategoryType
                if (!Object.values(Category_1.CategoryType).includes(type)) {
                    res.status(400).json({ message: 'Invalid category type' });
                    return;
                }
                const categories = await this.categoryService.getCategoriesByType(sellerId, type);
                res.status(200).json(categories);
            }
            catch (error) {
                console.error('Error fetching categories by type:', error);
                res.status(500).json({ message: 'Failed to fetch categories by type', error });
            }
        };
        /**
         * Get category by ID for the authenticated seller
         */
        this.getCategoryById = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const { id } = req.params;
                const category = await this.categoryService.getCategoryById(sellerId, id);
                if (!category) {
                    res.status(404).json({ message: 'Category not found' });
                    return;
                }
                res.status(200).json(category);
            }
            catch (error) {
                console.error('Error fetching category:', error);
                res.status(500).json({ message: 'Failed to fetch category', error });
            }
        };
        /**
         * Create a new category for the authenticated seller
         */
        this.createCategory = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const categoryData = { ...req.body, sellerId };
                // Validate that the type is a valid CategoryType
                if (!Object.values(Category_1.CategoryType).includes(categoryData.type)) {
                    res.status(400).json({ message: 'Invalid category type' });
                    return;
                }
                const newCategory = await this.categoryService.createCategory(categoryData);
                res.status(201).json(newCategory);
            }
            catch (error) {
                console.error('Error creating category:', error);
                res.status(500).json({ message: 'Failed to create category', error });
            }
        };
        /**
         * Update an existing category for the authenticated seller
         */
        this.updateCategory = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const { id } = req.params;
                const categoryData = req.body;
                // Validate that the type is a valid CategoryType if provided
                if (categoryData.type && !Object.values(Category_1.CategoryType).includes(categoryData.type)) {
                    res.status(400).json({ message: 'Invalid category type' });
                    return;
                }
                const updatedCategory = await this.categoryService.updateCategory(sellerId, id, categoryData);
                if (!updatedCategory) {
                    res.status(404).json({ message: 'Category not found' });
                    return;
                }
                res.status(200).json(updatedCategory);
            }
            catch (error) {
                console.error('Error updating category:', error);
                res.status(500).json({ message: 'Failed to update category', error });
            }
        };
        /**
         * Delete a category for the authenticated seller
         */
        this.deleteCategory = async (req, res) => {
            try {
                const sellerId = req.user.id;
                const { id } = req.params;
                const success = await this.categoryService.deleteCategory(sellerId, id);
                if (!success) {
                    res.status(404).json({ message: 'Category not found' });
                    return;
                }
                res.status(204).send();
            }
            catch (error) {
                console.error('Error deleting category:', error);
                res.status(500).json({ message: 'Failed to delete category', error });
            }
        };
    }
}
exports.CategoryController = CategoryController;
