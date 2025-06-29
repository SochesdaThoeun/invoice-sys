"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentTypeTable1697301234581 = void 0;
class CreatePaymentTypeTable1697301234581 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "payment_types" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "description" text,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );
            
            -- Create index on name for faster lookups
            CREATE INDEX "IDX_payment_types_name" ON "payment_types" ("name");
            
            -- Insert some default payment types
            INSERT INTO "payment_types" ("name", "description") 
            VALUES 
                ('Credit Card', 'Payment via credit card'),
                ('Bank Transfer', 'Payment via bank transfer'),
                ('Cash', 'Cash on delivery'),
                ('PayPal', 'Payment via PayPal'),
                ('Crypto', 'Payment via cryptocurrency');
                
            -- Add foreign key constraint from orders to payment_types
            ALTER TABLE "orders"
            ADD CONSTRAINT "FK_orders_payment_type" 
            FOREIGN KEY ("paymentTypeId") 
            REFERENCES "payment_types" ("id");
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_orders_payment_type";
            DROP INDEX IF EXISTS "IDX_payment_types_name";
            DROP TABLE IF EXISTS "payment_types";
        `);
    }
}
exports.CreatePaymentTypeTable1697301234581 = CreatePaymentTypeTable1697301234581;
