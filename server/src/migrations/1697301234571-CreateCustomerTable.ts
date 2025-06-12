import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerTable1697301234571 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_customers_businessAddressId";
            DROP INDEX IF EXISTS "IDX_customers_email";
            DROP INDEX IF EXISTS "IDX_customers_sellerId";
            DROP TABLE IF EXISTS "customers";
        `);
    }
} 