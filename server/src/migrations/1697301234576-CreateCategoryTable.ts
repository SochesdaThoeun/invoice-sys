import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoryTable1697301234576 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the enum type already exists
        const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'category_type_enum'
            );
        `);
        
        // Create the enum type only if it doesn't exist
        if (!enumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "category_type_enum" AS ENUM ('INCOME', 'EXPENSE', 'ASSET', 'LIABILITY');`);
        }
        
        // Check if the categories table already exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = 'categories'
            );
        `);
        
        // Create the table only if it doesn't exist
        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE "categories" (
                    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "sellerId" uuid NOT NULL,
                    "name" varchar NOT NULL,
                    "type" "category_type_enum" NOT NULL,
                    "parentId" uuid,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "FK_categories_seller" FOREIGN KEY ("sellerId") REFERENCES "users" ("id"),
                    CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parentId") REFERENCES "categories" ("id")
                );
                
                -- Create index on sellerId for tenant isolation queries
                CREATE INDEX "IDX_categories_sellerId" ON "categories" ("sellerId");
                
                -- Create index on type for filtering
                CREATE INDEX "IDX_categories_type" ON "categories" ("type");
                
                -- Create index on parentId for hierarchical queries
                CREATE INDEX "IDX_categories_parentId" ON "categories" ("parentId");
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_categories_parentId";
            DROP INDEX IF EXISTS "IDX_categories_type";
            DROP INDEX IF EXISTS "IDX_categories_sellerId";
            DROP TABLE IF EXISTS "categories";
            DROP TYPE IF EXISTS "category_type_enum";
        `);
    }
} 