import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTaxCodeTable1697301234569 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tax_codes" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "sellerId" uuid NOT NULL,
                "countryCode" varchar NOT NULL,
                "region" varchar,
                "rate" decimal(5,2) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_tax_codes_seller" FOREIGN KEY ("sellerId") REFERENCES "users" ("id")
            );
            
            -- Add foreign key constraint from products to tax_codes table
            ALTER TABLE "products"
            ADD CONSTRAINT "FK_products_tax_code" 
            FOREIGN KEY ("taxCodeId") 
            REFERENCES "tax_codes"("id");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_tax_code";
            DROP TABLE "tax_codes";
        `);
    }
} 