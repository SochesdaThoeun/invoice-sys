import { AppDataSource } from './data-source';

/**
 * Script to revert the last migration manually
 */
async function revertLatestMigration() {
  try {
    console.log('Attempting to connect to database...');
    console.log('Database config:', {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5458', 10),
      username: process.env.DB_USER || 'postgres',
      database: process.env.DB_NAME || 'invoice_sys',
    });
    
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Data source initialized successfully');

    // Revert the most recent migration
    await AppDataSource.undoLastMigration();
    console.log('Migration reverted successfully');

    // Close the connection
    await AppDataSource.destroy();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error reverting migration:', error);
    process.exit(1);
  }
}

// Run the function
revertLatestMigration(); 