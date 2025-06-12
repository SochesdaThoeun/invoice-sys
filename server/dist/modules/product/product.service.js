"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const data_source_1 = require("../../data-source");
const Product_1 = require("../../entities/Product");
class ProductService {
    constructor() {
        this.productRepository = data_source_1.AppDataSource.getRepository(Product_1.Product);
        this.findAll = async (sellerId, page = 1, limit = 10) => {
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
        this.findById = async (id, sellerId) => {
            return this.productRepository.findOneBy({ id, sellerId });
        };
        this.findBySku = async (sku, sellerId) => {
            return this.productRepository.findOneBy({ sku, sellerId });
        };
        this.create = async (productData) => {
            const product = this.productRepository.create(productData);
            return this.productRepository.save(product);
        };
        this.update = async (id, sellerId, productData) => {
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
        this.delete = async (id, sellerId) => {
            // First verify this product belongs to the seller
            const product = await this.productRepository.findOneBy({ id, sellerId });
            if (!product) {
                return false;
            }
            const result = await this.productRepository.delete({ id, sellerId });
            return result.affected ? result.affected > 0 : false;
        };
    }
}
exports.ProductService = ProductService;
