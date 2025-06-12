import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInvoiceTable1697301234574 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the enum type already exists
        const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'invoice_status_enum'
            );
        `);
        
        // Create the enum type only if it doesn't exist
        if (!enumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "invoice_status_enum" AS ENUM ('DRAFT', 'ISSUED', 'PAID');`);
        } else {
            // If it exists, check if the PAID value is already in the enum
            const paidExists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT 1 FROM pg_enum 
                    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'invoice_status_enum')
                    AND enumlabel = 'PAID'
                );
            `);
            
            // Add the PAID value if it doesn't exist
            if (!paidExists[0].exists) {
                await queryRunner.query(`ALTER TYPE "invoice_status_enum" ADD VALUE 'PAID';`);
            }
        }
        
        // Check if the invoices table already exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices'
            );
        `);
        
        // Create the table only if it doesn't exist
        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE "invoices" (
                    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "sellerId" uuid NOT NULL,
                    "customerId" uuid NOT NULL,
                    "orderId" uuid,
                    "language" varchar,
                    "governmentTemplate" varchar,
                    "status" "invoice_status_enum" NOT NULL DEFAULT 'DRAFT',
                    "totalAmount" decimal(10,2) NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "FK_invoices_seller" FOREIGN KEY ("sellerId") REFERENCES "users" ("id"),
                    CONSTRAINT "FK_invoices_customer" FOREIGN KEY ("customerId") REFERENCES "customers" ("id"),
                    CONSTRAINT "FK_invoices_order" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE SET NULL
                );
                
                -- Create index on sellerId for tenant isolation queries
                CREATE INDEX "IDX_invoices_sellerId" ON "invoices" ("sellerId");
                
                -- Create index on customerId for faster lookups
                CREATE INDEX "IDX_invoices_customerId" ON "invoices" ("customerId");
                
                -- Create index on orderId for faster lookups
                CREATE INDEX "IDX_invoices_orderId" ON "invoices" ("orderId");
                
                -- Create index on status for filtering
                CREATE INDEX "IDX_invoices_status" ON "invoices" ("status");
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_invoices_status";
            DROP INDEX IF EXISTS "IDX_invoices_orderId";
            DROP INDEX IF EXISTS "IDX_invoices_customerId";
            DROP INDEX IF EXISTS "IDX_invoices_sellerId";
            DROP TABLE IF EXISTS "invoices";
            DROP TYPE IF EXISTS "invoice_status_enum";
        `);
    }
} 