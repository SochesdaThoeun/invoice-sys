"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const productController = new product_controller_1.ProductController();
// Get all products
router.get('/', auth_middleware_1.authMiddleware, productController.getAllProducts);
// Get product by ID
router.get('/:id', auth_middleware_1.authMiddleware, productController.getProductById);
// Get product by SKU
router.get('/sku/:sku', auth_middleware_1.authMiddleware, productController.getProductBySku);
// Create new product
router.post('/', auth_middleware_1.authMiddleware, productController.createProduct);
// Update product
router.put('/:id', auth_middleware_1.authMiddleware, productController.updateProduct);
// Delete product
router.delete('/:id', auth_middleware_1.authMiddleware, productController.deleteProduct);
exports.default = router;
