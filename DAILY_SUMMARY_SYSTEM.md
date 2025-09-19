# Daily Summary System

This document describes the daily summary system that combines mood tracking, journal entries, and perspective sessions to provide AI-enhanced insights for weekly and monthly behavior analysis.

## Overview

The daily summary system:
1. **Collects** daily mood, journal, and perspective session data
2. **Analyzes** the data using AI to generate wellness scores and insights
3. **Stores** the analysis in a dedicated database table
4. **Displays** enhanced mood trends in the 7-day mood tracker
5. **Runs automatically** via GitHub Actions cron job

## Database Schema

### DailySummary Table
```sql
model DailySummary {
  id                String   @id @default(cuid())
  user_id           String
  date              DateTime
  day               Int
  week              Int
  month             Int
  year              Int
  
  // Mood data
  mood_emoji        String?
  mood_rate         Int?
  
  // AI Analysis scores (1-10)
  happiness_score   Int
  sadness_score     Int
  anxiety_score     Int
  energy_score      Int
  loneliness_score  Int
  overall_wellness  Int
  
  // AI generated content
  ai_summary        String
  key_insights      Json     // Array of insights
  
  // Activity counts
  journal_count     Int      @default(0)
  perspective_count Int      @default(0)
  
  // Raw data references (for debugging/auditing)
  mood_ids          Json?    // Array of mood entry IDs
  journal_ids       Json?    // Array of journal entry IDs
  session_ids       Json?    // Array of session IDs
  
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@unique([user_id, date])
  @@map("daily_summaries")
}
```

## API Endpoints

### 1. Generate Daily Summary
- **POST** `/api/daily-summary/generate`
- **Purpose**: Manually generate daily summary for current user
- **Body**: `{ "date": "2024-01-15" }` (optional, defaults to today)
- **Response**: Summary data with AI analysis

### 2. Get Daily Summaries
- **GET** `/api/daily-summary?days=7`
- **Purpose**: Retrieve daily summaries for a user
- **Query Params**: 
  - `days`: Number of days to retrieve (default: 7)
  - `startDate`: Start date (optional)
  - `endDate`: End date (optional)
- **Response**: Array of summary data

### 3. Batch Generation (Cron Job)
- **POST** `/api/daily-summary/generate-batch`
- **Purpose**: Generate summaries for all active users
- **Headers**: `Authorization: Bearer {CRON_SECRET}`
- **Response**: Batch processing results

## GitHub Actions Cron Job

The system includes a GitHub Actions workflow that runs daily at 11:59 PM UTC:

```yaml
name: Daily Summary Generation
on:
  schedule:
    - cron: '59 23 * * *'
  workflow_dispatch:

jobs:
  generate-daily-summaries:
    runs-on: ubuntu-latest
    steps:
      - name: Generate Daily Summaries
        run: |
          # Calls the batch generation endpoint
          curl -X POST \
            -H "Authorization: Bearer $CRON_SECRET" \
            -H "Content-Type: application/json" \
            "$APP_URL/api/daily-summary/generate-batch"
```

## Setup Instructions

### 1. Database Migration
```bash
npx prisma migrate dev --name add_daily_summaries
```

### 2. Environment Variables
Add to your `.env` file:
```
CRON_SECRET=your-secure-cron-secret
```

### 3. GitHub Secrets
Add these secrets to your GitHub repository:
- `APP_URL`: Your deployed app URL (e.g., https://your-app.vercel.app)
- `CRON_SECRET`: Same secret as in your .env file

### 4. Test the System
```bash
# Run the test script
node test_daily_summary.js

# Or manually test via API
curl -X POST http://localhost:3000/api/daily-summary/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15"}'
```

## How It Works

### 1. Data Collection
The system collects data from three sources:
- **Mood entries**: Emoji and intensity rating
- **Journal entries**: Content, title, and mood emoji
- **Perspective sessions**: User input and session status

### 2. AI Analysis
The `analyzeDailyMood` function processes the data to generate:
- **Wellness scores** (1-10): Happiness, sadness, anxiety, energy, loneliness
- **Overall wellness score** (1-10)
- **AI summary** (50 words max)
- **Key insights** (array of insights)

### 3. Storage
Daily summaries are stored with:
- Unique constraint on `user_id` and `date`
- References to original data IDs for auditing
- Activity counts for quick reference

### 4. Display
The 7-day mood tracker automatically:
- Uses daily summaries when available
- Falls back to raw mood data if no summaries exist
- Shows AI analysis and enhanced insights
- Displays wellness breakdown

## Benefits

1. **Enhanced Insights**: AI analysis provides deeper understanding of daily patterns
2. **Comprehensive Data**: Combines mood, journal, and perspective data
3. **Automated Processing**: Runs daily without manual intervention
4. **Backward Compatible**: Falls back to existing mood data if summaries unavailable
5. **Scalable**: Handles multiple users efficiently via batch processing

## Troubleshooting

### Common Issues

1. **No daily summaries generated**
   - Check if users have activity (mood, journal, or perspective sessions)
   - Verify GitHub Actions are running
   - Check CRON_SECRET matches between GitHub and app

2. **Database connection errors**
   - Ensure database is accessible
   - Run migration: `npx prisma migrate dev`

3. **AI analysis failures**
   - Check GOOGLE_AI_API_KEY is set
   - Verify API key has sufficient quota

### Debugging

1. **Check daily summaries in database**:
```sql
SELECT * FROM daily_summaries 
WHERE user_id = 'your-user-id' 
ORDER BY date DESC 
LIMIT 7;
```

2. **Test manual generation**:
```bash
curl -X POST http://localhost:3000/api/daily-summary/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

3. **Check GitHub Actions logs**:
   - Go to Actions tab in GitHub
   - View "Daily Summary Generation" workflow runs

## Future Enhancements

1. **Weekly/Monthly Aggregations**: Generate weekly and monthly summaries
2. **Trend Analysis**: Identify patterns over time
3. **Notifications**: Alert users about insights or patterns
4. **Export Data**: Allow users to download their summary data
5. **Custom Insights**: Personalized recommendations based on patterns
