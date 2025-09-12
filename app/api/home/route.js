// app/api/home/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { authenticateUser } from '../../../lib/auth';

// GET /api/home - Get personalized home page data
export async function GET(request) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // Get current time for personalized greeting
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Good evening';
    
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 17) {
      greeting = 'Good afternoon';
    }

    // Get today's mood
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMood = await prisma.mood.findFirst({
      where: {
        user_id: user.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { date: 'desc' }
    });

    // Get recent activities (last 3 items)
    const [recentJournals, recentSessions, unreadNotifications] = await Promise.all([
      prisma.journal.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          mood_emoji: true,
          created_at: true
        }
      }),
      prisma.perspectiveSession.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        take: 3,
        select: {
          id: true,
          user_input: true,
          status: true,
          created_at: true
        }
      }),
      prisma.notification.count({
        where: {
          user_id: user.id,
          is_read: false
        }
      })
    ]);

    // Get 7-day mood trend for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const moodTrends = await prisma.mood.findMany({
      where: {
        user_id: user.id,
        date: {
          gte: sevenDaysAgo,
          lte: now
        }
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        mood_rate: true,
        mood_emoji: true
      }
    });

    // Process mood trends for chart
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(sevenDaysAgo);
      currentDate.setDate(sevenDaysAgo.getDate() + i);
      
      const dayMood = moodTrends.find(mood => {
        const moodDate = new Date(mood.date);
        return moodDate.toDateString() === currentDate.toDateString();
      });

      chartData.push({
        date: currentDate.toISOString().split('T')[0],
        day: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        mood_rate: dayMood ? dayMood.mood_rate : null,
        mood_emoji: dayMood ? dayMood.mood_emoji : null
      });
    }

    // Generate smart recommendations based on mood and activity
    const recommendations = generateSmartRecommendations(todayMood, recentJournals.length, recentSessions.length);

    return NextResponse.json({
      greeting,
      user: {
        name: user.first_name
      },
      todayMood,
      recentActivity: {
        journals: recentJournals,
        sessions: recentSessions,
        unreadNotifications
      },
      moodTrends: chartData,
      recommendations
    });

  } catch (error) {
    console.error('Error fetching home data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    );
  }
}

// Generate smart recommendations based on user data
function generateSmartRecommendations(todayMood, journalCount, sessionCount) {
  const recommendations = [];

  // Mood-based recommendations
  if (!todayMood) {
    recommendations.push({
      title: "Check in with yourself",
      description: "Take a moment to reflect on how you're feeling right now",
      type: "mood"
    });
  } else if (todayMood.mood_rate <= 3) {
    recommendations.push({
      title: "Self-care reminder",
      description: "You're having a tough day. Remember to be gentle with yourself and take things one step at a time",
      type: "support"
    });
  } else if (todayMood.mood_rate >= 8) {
    recommendations.push({
      title: "Share your positive energy",
      description: "Your good mood is contagious! Consider reaching out to someone who might need a boost",
      type: "social"
    });
  } else if (todayMood.mood_emoji === '🤔') {
    recommendations.push({
      title: "Mindful reflection",
      description: "You seem thoughtful today. This is a perfect time for some quiet contemplation or journaling",
      type: "reflection"
    });
  }

  // Activity-based recommendations
  if (journalCount === 0) {
    recommendations.push({
      title: "Start your journaling journey",
      description: "Writing down your thoughts can help you process emotions and gain clarity",
      type: "journal"
    });
  }

  if (sessionCount === 0) {
    recommendations.push({
      title: "Begin perspective work",
      description: "A fresh perspective can help you see challenges in a new light",
      type: "perspective"
    });
  }

  // General wellness recommendations
  const generalRecommendations = [
    {
      title: "Mindful breathing",
      description: "Take 5 deep breaths and notice how your body feels with each inhale and exhale",
      type: "mindfulness"
    },
    {
      title: "Gratitude practice",
      description: "Think of three things you're grateful for today, no matter how small",
      type: "wellness"
    },
    {
      title: "Gentle movement",
      description: "Even a short walk or gentle stretch can boost your mood and energy",
      type: "wellness"
    }
  ];

  // Return mix of recommendations (max 2 for carousel)
  const allRecommendations = [...recommendations, ...generalRecommendations];
  return allRecommendations.slice(0, 2);
}
