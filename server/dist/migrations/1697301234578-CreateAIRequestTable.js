"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAIRequestTable1697301234578 = void 0;
class CreateAIRequestTable1697301234578 {
    async up(queryRunner) {
        // Check if the ai_requests table already exists
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_requests'
            );
        `);
        // Create the table only if it doesn't exist
        if (!tableExists[0].exists) {
            await queryRunner.query(`
                CREATE TABLE "ai_requests" (
                    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                    "sellerId" uuid NOT NULL,
                    "prompt" text NOT NULL,
                    "responseJson" jsonb,
                    "tokensUsed" integer,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "FK_ai_requests_seller" FOREIGN KEY ("sellerId") REFERENCES "users" ("id")
                );
                
                -- Create index on sellerId for tenant isolation queries
                CREATE INDEX "IDX_ai_requests_sellerId" ON "ai_requests" ("sellerId");
            `);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_ai_requests_sellerId";
            DROP TABLE IF EXISTS "ai_requests";
        `);
    }
}
exports.CreateAIRequestTable1697301234578 = CreateAIRequestTable1697301234578;
