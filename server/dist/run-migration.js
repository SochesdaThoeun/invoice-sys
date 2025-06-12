"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
/**
 * Script to run migrations manually
 */
async function runMigrations() {
    try {
        console.log('Attempting to connect to database...');
        console.log('Database config:', {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5458', 10),
            username: process.env.DB_USER || 'postgres',
            database: process.env.DB_NAME || 'invoice_sys',
        });
        // Initialize the data source
        await data_source_1.AppDataSource.initialize();
        console.log('Data source initialized successfully');
        // Run migrations
        const migrations = await data_source_1.AppDataSource.runMigrations();
        console.log('Migrations completed successfully');
        console.log('Applied migrations:', migrations.map(m => m.name).join(', '));
        // Close the connection
        await data_source_1.AppDataSource.destroy();
        console.log('Connection closed');
    }
    catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
}
// Run the function
runMigrations();
