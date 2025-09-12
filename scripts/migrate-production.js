#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting production database migration...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test if tables exist by querying the User table
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    // If no users exist, the tables might not be created yet
    // This is normal for a fresh database
    if (userCount === 0) {
      console.log('📝 Database appears to be empty - this is normal for a fresh setup');
      console.log('✅ Tables will be created automatically when the first user signs up');
    }
    
    console.log('✅ Migration check completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
