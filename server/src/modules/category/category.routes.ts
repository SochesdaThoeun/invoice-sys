import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const categoryController = new CategoryController();

// Get all categories
router.get('/', authMiddleware, categoryController.getAllCategories);

// Get categories by type
router.get('/type/:type', authMiddleware, categoryController.getCategoriesByType);

// Get category by ID
router.get('/:id', authMiddleware, categoryController.getCategoryById);

// Create a new category
router.post('/', authMiddleware, categoryController.createCategory);

// Update an existing category
router.put('/:id', authMiddleware, categoryController.updateCategory);

// Delete a category
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

export default router; 