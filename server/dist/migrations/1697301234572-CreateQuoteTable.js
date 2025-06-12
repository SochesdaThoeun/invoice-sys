"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuoteTable1697301234572 = void 0;
class CreateQuoteTable1697301234572 {
    async up(queryRunner) {
        // Check if the enum type already exists
        const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'quote_status_enum'
            );
        `);
        // Create the enum type only if it doesn't exist
        if (!enumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "quote_status_enum" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');`);
        }
        // Check if the quotes table already exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes'
            );
        `);
        // Create the table only if it doesn't exist
        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE "quotes" (
                    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "sellerId" uuid NOT NULL,
                    "customerId" uuid NOT NULL,
                    "orderId" uuid,
                    "totalEstimate" decimal(10,2) NOT NULL,
                    "expiresAt" TIMESTAMP,
                    "status" "quote_status_enum" NOT NULL DEFAULT 'DRAFT',
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "FK_quotes_seller" FOREIGN KEY ("sellerId") REFERENCES "users" ("id"),
                    CONSTRAINT "FK_quotes_customer" FOREIGN KEY ("customerId") REFERENCES "customers" ("id")
                    -- FK constraint to orders table will be added after orders table is created
                );
                
                -- Create index on sellerId for tenant isolation queries
                CREATE INDEX "IDX_quotes_sellerId" ON "quotes" ("sellerId");
                
                -- Create index on customerId for faster lookups
                CREATE INDEX "IDX_quotes_customerId" ON "quotes" ("customerId");
                
                -- Create index on status for filtering
                CREATE INDEX "IDX_quotes_status" ON "quotes" ("status");
            `);
        }
        // Check if both quotes and orders tables exist 
        const ordersExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = 'orders'
            );
        `);
        // Only add the constraint if both tables exist
        if (tableExists[0].exists && ordersExists[0].exists) {
            // Check if the constraint already exists
            const constraintExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_quotes_order' 
                    AND table_name = 'quotes'
                );
            `);
            if (!constraintExists[0].exists) {
                // Add the FK constraint
                await queryRunner.query(`
                    ALTER TABLE "quotes"
                    ADD CONSTRAINT "FK_quotes_order" 
                    FOREIGN KEY ("orderId") 
                    REFERENCES "orders"("id") ON DELETE SET NULL;
                    
                    -- Create index on orderId for faster lookups
                    CREATE INDEX IF NOT EXISTS "IDX_quotes_orderId" ON "quotes" ("orderId");
                `);
            }
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "quotes" DROP CONSTRAINT IF EXISTS "FK_quotes_order";
            DROP INDEX IF EXISTS "IDX_quotes_orderId";
            DROP INDEX IF EXISTS "IDX_quotes_status";
            DROP INDEX IF EXISTS "IDX_quotes_customerId";
            DROP INDEX IF EXISTS "IDX_quotes_sellerId";
            DROP TABLE IF EXISTS "quotes";
            DROP TYPE IF EXISTS "quote_status_enum";
        `);
    }
}
exports.CreateQuoteTable1697301234572 = CreateQuoteTable1697301234572;
