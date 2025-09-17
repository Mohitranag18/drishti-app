// lib/prisma.js - Updated to support both SQLite and PostgreSQL with better connection handling
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
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  };

  // Add connection pooling and retry configuration for PostgreSQL
  if (provider === 'postgresql') {
    prismaConfig.datasources.db.url = process.env.DATABASE_URL;
    
    // Add connection pool configuration
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.set('connection_limit', '10');
    url.searchParams.set('pool_timeout', '20');
    url.searchParams.set('connect_timeout', '60');
    prismaConfig.datasources.db.url = url.toString();
  }

  return new PrismaClient(prismaConfig);
};

// Create Prisma client with retry logic
const createPrismaClientWithRetry = () => {
  const client = createPrismaClient();
  
  // Add connection retry logic
  const originalConnect = client.$connect.bind(client);
  client.$connect = async () => {
    let retries = 3;
    while (retries > 0) {
      try {
        await originalConnect();
        return;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        console.log(`Database connection failed, retrying in 2 seconds... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };
  
  return client;
};

export const prisma = globalForPrisma.prisma || createPrismaClientWithRetry();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await prisma.$disconnect();
  process.exit(1);
});
