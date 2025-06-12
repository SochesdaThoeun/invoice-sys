import { Request, Response } from 'express';
import { ProductService } from './product.service';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  public getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const products = await this.productService.findAll(sellerId, page, limit);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get products', error });
    }
  };

  public getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const product = await this.productService.findById(req.params.id, sellerId);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get product', error });
    }
  };

  public getProductBySku = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const product = await this.productService.findBySku(req.params.sku, sellerId);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get product by SKU', error });
    }
  };

  public createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { sku, name, description, defaultPrice, taxCodeId } = req.body;
      
      const product = await this.productService.create({
        sellerId,
        sku,
        name,
        description,
        defaultPrice,
        taxCodeId: taxCodeId && taxCodeId.trim() !== '' ? taxCodeId : null
      });

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create product', error });
    }
  };

  public updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const { sku, name, description, defaultPrice, taxCodeId } = req.body;
      
      const updatedProduct = await this.productService.update(
        req.params.id,
        sellerId,
        {
          sku,
          name,
          description,
          defaultPrice,
          taxCodeId: taxCodeId && taxCodeId.trim() !== '' ? taxCodeId : null
        }
      );

      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update product', error });
    }
  };

  public deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const sellerId = req.user.id;
      const success = await this.productService.delete(req.params.id, sellerId);
      if (!success) {
        res.status(404).json({ message: 'Product not found or could not be deleted' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete product', error });
    }
  };
} 