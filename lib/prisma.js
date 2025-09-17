// lib/prisma.js - Updated to support both SQLite and PostgreSQL
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Determine database provider based on DATABASE_URL
const getDatabaseProvider = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  if (databaseUrl.startsWith('file:')) {
    return 'sqlite';
  } else if (databaseUrl.startsWith('postgresql:')) {
    return 'postgresql';
  } else {
    throw new Error('Unsupported database provider in DATABASE_URL');
  }
};

// Create Prisma client with appropriate configuration
const createPrismaClient = () => {
  const provider = getDatabaseProvider();
  
  const prismaConfig = {
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  };

  // Add connection pooling for PostgreSQL in production
  if (provider === 'postgresql' && process.env.NODE_ENV === 'production') {
    prismaConfig.datasources = {
      db: {
        url: process.env.DATABASE_URL,
      },
    };
  }

  return new PrismaClient(prismaConfig);
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
