# Database Setup Guide

This project supports both SQLite (development) and PostgreSQL (production) databases.

## Development Setup (SQLite)

1. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

4. **Push Database Schema**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Production Setup (PostgreSQL)

1. **Set Environment Variables**
   ```bash
   export DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   export DIRECT_URL="postgresql://username:password@host:port/database?schema=public"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

4. **Run Migrations**
   ```bash
   npm run db:migrate:deploy
   ```

5. **Build and Start**
   ```bash
   npm run build
   npm start
   ```

## Database Management Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes (SQLite)
- `npm run db:migrate` - Create and run migrations (PostgreSQL)
- `npm run db:migrate:deploy` - Deploy migrations (Production)
- `npm run db:reset` - Reset database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:validate` - Validate database connection

## Environment Variables

### Development (.env.local)
```env
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"
JWT_SECRET="dev-jwt-secret"
GOOGLE_AI_API_KEY="your-api-key"
```

### Production
```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
DIRECT_URL="postgresql://username:password@host:port/database?schema=public"
JWT_SECRET="your-production-jwt-secret"
GOOGLE_AI_API_KEY="your-api-key"
```

## Migration from SQLite to PostgreSQL

1. **Export SQLite Data** (if needed)
   ```bash
   sqlite3 prisma/dev.db .dump > backup.sql
   ```

2. **Set up PostgreSQL Database**
   - Create database and user
   - Set environment variables

3. **Run Migrations**
   ```bash
   npm run db:migrate:deploy
   ```

4. **Import Data** (if needed)
   - Convert SQLite dump to PostgreSQL format
   - Import using psql or pgAdmin

## Troubleshooting

### Common Issues

1. **Connection Refused (PostgreSQL)**
   - Check if PostgreSQL is running
   - Verify connection string format
   - Ensure database exists

2. **Permission Denied (SQLite)**
   - Check file permissions
   - Ensure directory is writable

3. **Migration Errors**
   - Check for schema conflicts
   - Verify environment variables
   - Review migration files

### Validation

Test your database connection:
```bash
npm run db:validate
```
