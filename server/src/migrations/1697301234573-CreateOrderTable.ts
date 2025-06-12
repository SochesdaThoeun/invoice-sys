import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderTable1697301234573 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the orders table already exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = 'orders'
            );
        `);
        
        // Create the table only if it doesn't exist
        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE "orders" (
                    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "sellerId" uuid NOT NULL,
                    "customerId" uuid NOT NULL,
                    "paymentTypeId" uuid,
                    "totalAmount" decimal(10,2) NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "FK_orders_seller" FOREIGN KEY ("sellerId") REFERENCES "users" ("id"),
                    CONSTRAINT "FK_orders_customer" FOREIGN KEY ("customerId") REFERENCES "customers" ("id")
                    -- FK constraint to payment_types will be added after payment_types table is created
                );
                
                -- Create index on sellerId for tenant isolation queries
                CREATE INDEX "IDX_orders_sellerId" ON "orders" ("sellerId");
                
                -- Create index on customerId for faster lookups
                CREATE INDEX "IDX_orders_customerId" ON "orders" ("customerId");
                
                -- Create index on paymentTypeId for faster lookups
                CREATE INDEX "IDX_orders_paymentTypeId" ON "orders" ("paymentTypeId");
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_orders_paymentTypeId";
            DROP INDEX IF EXISTS "IDX_orders_customerId";
            DROP INDEX IF EXISTS "IDX_orders_sellerId";
            DROP TABLE IF EXISTS "orders";
        `);
    }
} 