"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomerTable1697301234571 = void 0;
class CreateCustomerTable1697301234571 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "customers" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "sellerId" uuid NOT NULL,
                "name" varchar NOT NULL,
                "email" varchar,
                "address" text,
                "phone" varchar,
                "businessAddressId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_customers_seller" FOREIGN KEY ("sellerId") REFERENCES "users" ("id")
            );
            
            -- Create index on sellerId for tenant isolation queries
            CREATE INDEX "IDX_customers_sellerId" ON "customers" ("sellerId");
            
            -- Create index on email for faster lookups
            CREATE INDEX "IDX_customers_email" ON "customers" ("email");
            
            -- Create index on businessAddressId for faster lookups
            CREATE INDEX "IDX_customers_businessAddressId" ON "customers" ("businessAddressId");
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_customers_businessAddressId";
            DROP INDEX IF EXISTS "IDX_customers_email";
            DROP INDEX IF EXISTS "IDX_customers_sellerId";
            DROP TABLE IF EXISTS "customers";
        `);
    }
}
exports.CreateCustomerTable1697301234571 = CreateCustomerTable1697301234571;
