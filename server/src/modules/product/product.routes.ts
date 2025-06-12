import { Router } from 'express';
import { ProductController } from './product.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const productController = new ProductController();

// Get all products
router.get('/', authMiddleware, productController.getAllProducts);

// Get product by ID
router.get('/:id', authMiddleware, productController.getProductById);

// Get product by SKU
router.get('/sku/:sku', authMiddleware, productController.getProductBySku);

// Create new product
router.post('/', authMiddleware, productController.createProduct);

// Update product
router.put('/:id', authMiddleware, productController.updateProduct);

// Delete product
router.delete('/:id', authMiddleware, productController.deleteProduct);

export default router; 