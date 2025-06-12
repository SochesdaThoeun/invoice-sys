"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderCartTable1697301234580 = void 0;
class CreateOrderCartTable1697301234580 {
    async up(queryRunner) {
        // Check if the order_carts table already exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = 'order_carts'
            );
        `);
        // Create the table only if it doesn't exist
        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE "order_carts" (
                    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "orderId" uuid NOT NULL,
                    "productId" uuid,
                    "sellerId" uuid NOT NULL,
                    "sku" varchar NOT NULL,
                    "name" varchar NOT NULL,
                    "description" text,
                    "quantity" integer NOT NULL,
                    "unitPrice" decimal(10,2) NOT NULL,
                    "lineTotal" decimal(10,2) NOT NULL,
                    "taxRate" decimal(5,2) NOT NULL DEFAULT 0,
                    "taxCodeId" uuid,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "FK_order_carts_order" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE,
                    CONSTRAINT "FK_order_carts_product" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL,
                    CONSTRAINT "FK_order_carts_seller" FOREIGN KEY ("sellerId") REFERENCES "users" ("id") ON DELETE CASCADE,
                    CONSTRAINT "FK_order_carts_tax_code" FOREIGN KEY ("taxCodeId") REFERENCES "tax_codes" ("id") ON DELETE SET NULL
                );
                
                -- Create index on orderId for faster lookups
                CREATE INDEX "IDX_order_carts_orderId" ON "order_carts" ("orderId");
                
                -- Create index on productId for faster lookups
                CREATE INDEX "IDX_order_carts_productId" ON "order_carts" ("productId");
                -- Create index on sellerId for faster lookups
                CREATE INDEX "IDX_order_carts_sellerId" ON "order_carts" ("sellerId");
                -- Create index on taxCodeId for faster lookups
                CREATE INDEX "IDX_order_carts_taxCodeId" ON "order_carts" ("taxCodeId");
            `);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_order_carts_taxCodeId";
            DROP INDEX IF EXISTS "IDX_order_carts_sellerId";
            DROP INDEX IF EXISTS "IDX_order_carts_productId";
            DROP INDEX IF EXISTS "IDX_order_carts_orderId";
            DROP TABLE IF EXISTS "order_carts";
        `);
    }
}
exports.CreateOrderCartTable1697301234580 = CreateOrderCartTable1697301234580;
