"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLedgerEntryTable1697301234577 = void 0;
class CreateLedgerEntryTable1697301234577 {
    async up(queryRunner) {
        // Check if the enum type already exists
        const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'source_type_enum'
            );
        `);
        // Create the enum type only if it doesn't exist
        if (!enumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "source_type_enum" AS ENUM ('INVOICE', 'ORDER', 'QUOTE', 'PAYMENT', 'ADJUSTMENT', 'EXPENSE');`);
        }
        // Check if the ledger_entries table already exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = 'ledger_entries'
            );
        `);
        // Create the table only if it doesn't exist
        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE "ledger_entries" (
                    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "sellerId" uuid NOT NULL,
                    "debit" decimal(10,2) NOT NULL DEFAULT 0,
                    "credit" decimal(10,2) NOT NULL DEFAULT 0,
                    "categoryId" uuid NOT NULL,
                    "sourceType" "source_type_enum" NOT NULL,
                    "sourceId" uuid NOT NULL,
                    "transactionGroupId" uuid NOT NULL,
                    "description" text,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "FK_ledger_entries_seller" FOREIGN KEY ("sellerId") REFERENCES "users" ("id"),
                    CONSTRAINT "FK_ledger_entries_category" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id")
                );
                
                -- Create index on sellerId for tenant isolation queries
                CREATE INDEX "IDX_ledger_entries_sellerId" ON "ledger_entries" ("sellerId");
                
                -- Create index on categoryId for faster lookups
                CREATE INDEX "IDX_ledger_entries_categoryId" ON "ledger_entries" ("categoryId");
                
                -- Create index on sourceType for filtering
                CREATE INDEX "IDX_ledger_entries_sourceType" ON "ledger_entries" ("sourceType");
                
                -- Create index on sourceId for filtering
                CREATE INDEX "IDX_ledger_entries_sourceId" ON "ledger_entries" ("sourceId");
                
                -- Create index on transactionGroupId for grouping related entries
                CREATE INDEX "IDX_ledger_entries_transactionGroupId" ON "ledger_entries" ("transactionGroupId");
            `);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_ledger_entries_transactionGroupId";
            DROP INDEX IF EXISTS "IDX_ledger_entries_sourceId";
            DROP INDEX IF EXISTS "IDX_ledger_entries_sourceType";
            DROP INDEX IF EXISTS "IDX_ledger_entries_categoryId";
            DROP INDEX IF EXISTS "IDX_ledger_entries_sellerId";
            DROP TABLE IF EXISTS "ledger_entries";
            DROP TYPE IF EXISTS "source_type_enum";
        `);
    }
}
exports.CreateLedgerEntryTable1697301234577 = CreateLedgerEntryTable1697301234577;
