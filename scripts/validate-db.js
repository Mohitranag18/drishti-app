// scripts/validate-db.js - Database validation script
import { validateDatabaseConnection, getDatabaseConfig } from '../lib/database.js';

async function main() {
  console.log('🔍 Validating database configuration...\n');
  
  try {
    const config = getDatabaseConfig();
    console.log('📊 Database Configuration:');
    console.log(`   Provider: ${config.provider}`);
    console.log(`   Environment: ${config.isProduction ? 'Production' : 'Development'}`);
    console.log(`   URL: ${config.url.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
    console.log('');
    
    const result = await validateDatabaseConnection();
    
    if (result.success) {
      console.log('✅ Database connection successful!');
      process.exit(0);
    } else {
      console.log('❌ Database connection failed:');
      console.log(`   ${result.message}`);
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Configuration error:');
    console.log(`   ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
