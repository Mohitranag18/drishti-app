# AI-Enhanced Journal Features

## Overview
The journal system has been enhanced with AI-powered content generation to provide better user experience and more meaningful journal entries.

## Features

### 1. AI-Powered Perspective Session Journal Generation
When saving perspective sessions to the journal, the AI will:
- **Generate a personalized title** based on the session content
- **Create detailed journal content** written in first person, incorporating:
  - The original situation/input
  - Insights from perspective cards
  - Learnings from quiz responses
  - Personal, introspective tone
- **Generate a concise summary** (2-3 sentences, max 150 characters)
- **Select appropriate mood emoji** from: 😊, 😐, 😔, 😟, 🧠, ❤️, ✨, 😴, 😤, 🤔
- **Generate relevant tags** with the first tag being one of: "happy", "neutral", "sad", "other"

### 2. AI-Powered Manual Journal Enhancement
When creating manual journal entries, the AI will:
- **Generate a summary** based on the title and content
- **Select appropriate mood emoji** based on emotional tone
- **Generate relevant tags** for better organization

### 3. Enhanced Journal Detail Modal
- **Beautiful, responsive modal** for viewing full journal entries
- **Proper mood display** with icons and labels
- **Tag visualization** with styled chips
- **Reading time calculation**
- **Points earned display**
- **Smooth animations** and transitions

## Setup

### 1. Environment Variables
Create a `.env.local` file with:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret-here"
GOOGLE_AI_API_KEY="your-google-ai-api-key-here"
```

### 2. Google AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### 3. Install Dependencies
The required dependencies are already included in `package.json`:
- `@google/generative-ai` for AI integration

## API Changes

### Updated Endpoints

#### POST /api/journal
- **Input**: Only `title` and `content` are required
- **AI Enhancement**: Automatically generates `summary`, `mood_emoji`, and `tags`
- **Response**: Includes AI-generated fields

#### POST /api/perspective/save-to-journal
- **Enhanced**: Now uses AI to generate comprehensive journal content
- **Input**: `sessionId`
- **AI Enhancement**: Generates `title`, `content`, `summary`, `mood_emoji`, and `tags` based on entire session data

## Frontend Changes

### Journal Page (`app/journal/page.jsx`)
- **Simplified form**: Removed manual mood selection (AI generates it)
- **New modal**: Integrated `JournalDetailModal` for better entry viewing
- **AI indicator**: Added info box explaining AI enhancement
- **Improved UX**: Better loading states and error handling

### New Component: JournalDetailModal (`app/components/JournalDetailModal.jsx`)
- **Full-screen modal** with proper styling
- **Mood visualization** with icons and labels
- **Tag display** with styled chips
- **Reading time** and points display
- **Responsive design** for mobile and desktop

## AI Service (`lib/aiService.js`)

### Functions

#### `generatePerspectiveJournalContent(sessionData)`
- Generates comprehensive journal content for perspective sessions
- Uses session input, quizzes, and cards data
- Returns: `{ title, content, summary, mood_emoji, tags }`

#### `generateManualJournalContent(title, content)`
- Enhances manual journal entries with AI-generated metadata
- Returns: `{ summary, mood_emoji, tags }`

## Error Handling
- **Fallback content**: If AI generation fails, uses basic fallback content
- **Graceful degradation**: App continues to work even without AI
- **Error logging**: Detailed error logging for debugging

## Benefits

1. **Better Organization**: AI-generated tags help categorize entries
2. **Emotional Tracking**: Automatic mood detection for better insights
3. **Rich Content**: Perspective sessions create more meaningful journal entries
4. **Improved UX**: Beautiful modal for reading entries
5. **Time Saving**: Users don't need to manually select mood and tags
6. **Consistency**: Standardized format across all journal entries

## Future Enhancements

- **Sentiment Analysis**: More sophisticated emotional analysis
- **Trend Analysis**: AI-powered insights into mood patterns
- **Content Suggestions**: AI suggestions for journal prompts
- **Export Features**: Export journal entries with AI-generated metadata
