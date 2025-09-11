// test-db.js - Create this file in your project root
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test if we can connect and query
    const userCount = await prisma.user.count();
    console.log('✅ Database connected successfully!');
    console.log(`Current user count: ${userCount}`);
    
    // Test creating a user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User'
      }
    });
    
    console.log('✅ User created successfully:', testUser.email);
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    console.log('✅ Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();