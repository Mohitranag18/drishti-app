// lib/database.js - Database configuration utilities
import { PrismaClient } from '@prisma/client';

/**
 * Get database configuration based on environment
 */
export const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const isPostgreSQL = databaseUrl.startsWith('postgresql:');
  const isSQLite = databaseUrl.startsWith('file:');

  return {
    url: databaseUrl,
    provider: isPostgreSQL ? 'postgresql' : 'sqlite',
    isProduction,
    isPostgreSQL,
    isSQLite,
    directUrl: process.env.DIRECT_URL || databaseUrl,
  };
};

/**
 * Create database connection string for different environments
 */
export const createDatabaseUrl = (provider, config) => {
  if (provider === 'sqlite') {
    return `file:${config.path || './dev.db'}`;
  }
  
  if (provider === 'postgresql') {
    const { host, port, database, username, password, schema = 'public' } = config;
    return `postgresql://${username}:${password}@${host}:${port}/${database}?schema=${schema}`;
  }
  
  throw new Error(`Unsupported database provider: ${provider}`);
};

/**
 * Validate database connection
 */
export const validateDatabaseConnection = async () => {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    return { 
      success: false, 
      message: `Database connection failed: ${error.message}` 
    };
  }
};

/**
 * Get database migration commands
 */
export const getMigrationCommands = () => {
  const config = getDatabaseConfig();
  
  if (config.isPostgreSQL) {
    return {
      generate: 'npx prisma generate',
      migrate: 'npx prisma migrate deploy',
      reset: 'npx prisma migrate reset --force',
      status: 'npx prisma migrate status',
    };
  }
  
  return {
    generate: 'npx prisma generate',
    migrate: 'npx prisma db push',
    reset: 'npx prisma migrate reset --force',
    status: 'npx prisma db push --accept-data-loss',
  };
};
