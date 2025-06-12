import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1697301234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First check if the enum type already exists
        const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'user_role_enum'
            );
        `);
        
        // Create the enum type only if it doesn't exist
        if (!enumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'SELLER');`);
        }
        
        // Check if the users table already exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
            );
        `);
        
        // Create the table only if it doesn't exist
        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE "users" (
                    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "email" varchar NOT NULL UNIQUE,
                    "passwordHash" varchar NOT NULL,
                    "role" "user_role_enum" NOT NULL,
                    "locale" varchar,
                    "currency" varchar,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
                );
                
                -- Enable UUID extension if not already enabled
                CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "users";
            DROP TYPE IF EXISTS "user_role_enum";
        `);
    }
} 