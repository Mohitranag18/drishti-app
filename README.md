# Drishti - Mental Wellness App

A Next.js mental wellness application that helps users find new perspectives on their challenges through AI-powered insights, mood tracking, journaling, and personalized guidance.

## Features

- **Mood Tracking**: Daily mood logging with visual analytics
- **Perspective Sessions**: AI-powered perspective generation and interactive quizzes
- **Journaling**: Secure personal journaling with AI-generated summaries
- **Notifications**: Smart wellness reminders and notifications
- **User Analytics**: Personal wellness statistics and trends
- **Responsive Design**: Mobile-first design with glass morphism UI

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT-based authentication
- **AI Integration**: Google Gemini AI for content generation
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Google Gemini AI API key

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd drishti-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/drishti_db"
DIRECT_URL="postgresql://username:password@localhost:5432/drishti_db"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-here"

# Google Gemini AI API Key
GEMINI_API_KEY="your-gemini-api-key-here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

#### Option A: Local PostgreSQL Setup

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql
   
   # Windows: Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database and User**:
   ```bash
   # Connect to PostgreSQL
   sudo -u postgres psql
   
   # Create database and user
   CREATE DATABASE drishti_db;
   CREATE USER drishti_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE drishti_db TO drishti_user;
   \q
   ```

3. **Update DATABASE_URL** in `.env.local`:
   ```env
   DATABASE_URL="postgresql://drishti_user:your_password@localhost:5432/drishti_db"
   DIRECT_URL="postgresql://drishti_user:your_password@localhost:5432/drishti_db"
   ```

#### Option B: Cloud PostgreSQL (Recommended for Production)

Use services like:
- **Neon**: Free PostgreSQL cloud database
- **Supabase**: Open source Firebase alternative
- **Railway**: Simple cloud database hosting
- **Vercel Postgres**: Integrated with Vercel deployment

### 5. Database Migration

Run the following commands to set up your database schema:

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Open Prisma Studio to view your database
npm run db:studio
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations (development) |
| `npm run db:migrate:deploy` | Deploy migrations (production) |
| `npm run db:push` | Push schema changes without migration |
| `npm run db:reset` | Reset database and run migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:validate` | Validate database connection |

## Database Schema

The application uses the following main models:

- **User**: User accounts and preferences
- **Mood**: Daily mood tracking entries
- **PerspectiveSession**: AI-powered perspective sessions
- **PerspectiveQuizz**: Interactive quizzes within sessions
- **PerspectiveCard**: AI-generated perspective cards
- **Journal**: Personal journal entries
- **Notification**: User notifications and reminders

## Authentication

The app uses a custom JWT-based authentication system:

- User registration and login
- Secure password hashing with bcryptjs
- JWT token management
- Protected routes and API endpoints

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Core Features
- `GET/POST /api/mood` - Mood tracking
- `GET/POST /api/journal` - Journal management
- `GET/POST /api/perspective/*` - Perspective sessions
- `GET/POST /api/notifications` - Notification management
- `GET /api/user/stats` - User analytics

## Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Environment Variables**:
   Add all environment variables in Vercel dashboard.

3. **Database**:
   Use a cloud PostgreSQL service and update `DATABASE_URL`.

4. **Build Configuration**:
   The app includes a `vercel-build` script that handles Prisma generation.

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set up PostgreSQL** on your server.

3. **Run migrations**:
   ```bash
   npm run db:migrate:deploy
   ```

4. **Start the application**:
   ```bash
   npm start
   ```

## Project Structure

```
drishti-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── context/          # React contexts
│   └── [pages]/          # App pages
├── lib/                   # Utility libraries
│   ├── auth.js           # Authentication utilities
│   ├── database.js       # Database configuration
│   ├── prisma.js         # Prisma client
│   └── aiService.js      # AI integration
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── scripts/              # Utility scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DIRECT_URL` | Direct PostgreSQL connection (for migrations) | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application | Yes |

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists and user has permissions

2. **Migration Errors**:
   ```bash
   # Reset and retry
   npm run db:reset
   npm run db:migrate
   ```

3. **Prisma Client Issues**:
   ```bash
   # Regenerate client
   npm run db:generate
   ```

4. **Build Errors**:
   - Check all environment variables are set
   - Ensure PostgreSQL is accessible from build environment

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
