"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBusinessAddressTable1697301234580 = void 0;
class CreateBusinessAddressTable1697301234580 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "business_addresses" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "sellerId" uuid NOT NULL,
                "businessId" varchar NOT NULL,
                "country" varchar NOT NULL,
                "state" varchar NOT NULL,
                "street" varchar NOT NULL,
                "houseNumber" varchar NOT NULL,
                "address" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_business_addresses_seller" FOREIGN KEY ("sellerId") REFERENCES "users" ("id")
            );
            
            -- Create index on sellerId for tenant isolation queries
            CREATE INDEX "IDX_business_addresses_sellerId" ON "business_addresses" ("sellerId");
            
            -- Create index on businessId for faster lookups
            CREATE INDEX "IDX_business_addresses_businessId" ON "business_addresses" ("businessId");
            
            -- Add foreign key constraint from customers to business_addresses
            ALTER TABLE "customers"
            ADD CONSTRAINT "FK_customers_business_address" 
            FOREIGN KEY ("businessAddressId") 
            REFERENCES "business_addresses" ("id");
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "FK_customers_business_address";
            DROP INDEX IF EXISTS "IDX_business_addresses_businessId";
            DROP INDEX IF EXISTS "IDX_business_addresses_sellerId";
            DROP TABLE IF EXISTS "business_addresses";
        `);
    }
}
exports.CreateBusinessAddressTable1697301234580 = CreateBusinessAddressTable1697301234580;
