# Production Setup Guide for Vercel

## Current Issue
The app is configured to use SQLite (`file:./dev.db`) which doesn't work on Vercel's serverless environment. You need a PostgreSQL database for production.

## Quick Fix Steps

### 1. Set up a PostgreSQL Database

**Option A: Vercel Postgres (Recommended)**
1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to Storage tab
4. Create a new Postgres database
5. Copy the connection string

**Option B: Neon (Free tier)**
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string

**Option C: Supabase (Free tier)**
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

### 2. Configure Environment Variables in Vercel

In your Vercel dashboard, go to Settings > Environment Variables and add:

```
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
DIRECT_URL=postgresql://username:password@host:port/database?schema=public
JWT_SECRET=your-production-jwt-secret-change-this
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

### 3. Deploy and Run Migrations

After setting up the environment variables:

1. **Redeploy your app** - Vercel will automatically run `prisma generate` during build
2. **Run migrations** - You can do this by:
   - Adding a migration script to your Vercel project
   - Or running migrations manually after deployment

### 4. Test the Signup

Once deployed with the correct environment variables, the signup should work because:
- The app will connect to PostgreSQL instead of SQLite
- The database tables will be created automatically
- The signup API will be able to create users

## Migration Script (Optional)

If you want to run migrations automatically, create this file:

```javascript
// scripts/migrate.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running database migrations...');
  // Prisma will automatically create tables based on schema
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## Verification

After deployment, test:
1. Go to your app's signup page
2. Try to create a new account
3. Check if the user is created in your database
4. Verify login works

## Troubleshooting

If signup still doesn't work:
1. Check Vercel function logs for errors
2. Verify environment variables are set correctly
3. Ensure the PostgreSQL database is accessible
4. Check if the database tables exist
