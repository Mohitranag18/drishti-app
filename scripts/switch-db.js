// scripts/switch-db.js - Switch between database providers
import fs from 'fs';
import path from 'path';

const targetProvider = process.argv[2];

if (!targetProvider || !['sqlite', 'postgresql'].includes(targetProvider)) {
  console.log('Usage: node scripts/switch-db.js <sqlite|postgresql>');
  process.exit(1);
}

const schemaDir = path.join(process.cwd(), 'prisma');
const sourceFile = path.join(schemaDir, `schema.${targetProvider}.prisma`);
const targetFile = path.join(schemaDir, 'schema.prisma');

try {
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Schema file not found: ${sourceFile}`);
    process.exit(1);
  }

  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ Switched to ${targetProvider} schema`);
  console.log(`📁 Copied ${sourceFile} to ${targetFile}`);
  
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm run db:generate');
  console.log('2. Run: npm run db:push (for SQLite) or npm run db:migrate (for PostgreSQL)');
  
} catch (error) {
  console.error('❌ Error switching database schema:', error.message);
  process.exit(1);
}
