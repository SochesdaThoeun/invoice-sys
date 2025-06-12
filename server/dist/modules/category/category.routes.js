"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const categoryController = new category_controller_1.CategoryController();
// Get all categories
router.get('/', auth_middleware_1.authMiddleware, categoryController.getAllCategories);
// Get categories by type
router.get('/type/:type', auth_middleware_1.authMiddleware, categoryController.getCategoriesByType);
// Get category by ID
router.get('/:id', auth_middleware_1.authMiddleware, categoryController.getCategoryById);
// Create a new category
router.post('/', auth_middleware_1.authMiddleware, categoryController.createCategory);
// Update an existing category
router.put('/:id', auth_middleware_1.authMiddleware, categoryController.updateCategory);
// Delete a category
router.delete('/:id', auth_middleware_1.authMiddleware, categoryController.deleteCategory);
exports.default = router;
