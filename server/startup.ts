import { databaseService } from './services/databaseService';

async function initializeDatabase() {
  console.log('🚀 Initializing database...');
  try {
    await databaseService.initializeDatabase();
    console.log('🎉 Database initialized successfully!');
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
  }
}

initializeDatabase();

export { initializeDatabase };

