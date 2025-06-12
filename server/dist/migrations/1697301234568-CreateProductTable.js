"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductTable1697301234568 = void 0;
class CreateProductTable1697301234568 {
    async up(queryRunner) {
        await queryRunner.query(`
            -- Enable UUID extension if not already enabled
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            
            CREATE TABLE "products" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "sellerId" uuid NOT NULL REFERENCES "users"("id"),
                "sku" varchar NOT NULL,
                "name" varchar NOT NULL,
                "description" text,
                "defaultPrice" decimal(10,2) NOT NULL,
                "taxCodeId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );
            
            -- Create index on SKU for faster lookups
            CREATE INDEX "IDX_products_sku" ON "products" ("sku");
            
            -- Create index on sellerId for tenant isolation queries
            CREATE INDEX "IDX_products_sellerId" ON "products" ("sellerId");
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_products_sellerId";
            DROP INDEX IF EXISTS "IDX_products_sku";
            DROP TABLE IF EXISTS "products";
        `);
    }
}
exports.CreateProductTable1697301234568 = CreateProductTable1697301234568;
CreateProductTable1697301234568.isTransaction = false;
