import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../../lib/authUtils';
import { prisma } from '../../../../lib/prisma';

// GET /api/user/email-preferences - Get user's email preferences
export async function GET(request) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const userWithPrefs = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        email: true,
        email_preferences: true
      }
    });

    if (!userWithPrefs) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse email preferences or return defaults
    let emailPrefs = {
      weekly_summary: true,
      monthly_summary: true,
      milestones: true,
      daily_reminders: false,
      enabled: true
    };

    if (userWithPrefs.email_preferences) {
      try {
        const parsedPrefs = typeof userWithPrefs.email_preferences === 'string' 
          ? JSON.parse(userWithPrefs.email_preferences)
          : userWithPrefs.email_preferences;
        
        emailPrefs = { ...emailPrefs, ...parsedPrefs };
      } catch (parseError) {
        console.error('Error parsing email preferences:', parseError);
      }
    }

    return NextResponse.json({
      email: userWithPrefs.email,
      preferences: emailPrefs
    });

  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/user/email-preferences - Update user's email preferences
export async function PUT(request) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const body = await request.json();
    const { preferences } = body;

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Valid preferences object is required' },
        { status: 400 }
      );
    }

    // Validate preference fields
    const validFields = ['weekly_summary', 'monthly_summary', 'milestones', 'daily_reminders', 'enabled'];
    const filteredPrefs = {};
    
    for (const [key, value] of Object.entries(preferences)) {
      if (validFields.includes(key)) {
        filteredPrefs[key] = Boolean(value);
      }
    }

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email_preferences: filteredPrefs,
        updated_at: new Date()
      },
      select: {
        email: true,
        email_preferences: true
      }
    });

    // Parse updated preferences for response
    let emailPrefs = filteredPrefs;
    if (typeof updatedUser.email_preferences === 'string') {
      try {
        emailPrefs = JSON.parse(updatedUser.email_preferences);
      } catch (parseError) {
        console.error('Error parsing updated email preferences:', parseError);
      }
    }

    return NextResponse.json({
      message: 'Email preferences updated successfully',
      email: updatedUser.email,
      preferences: emailPrefs
    });

  } catch (error) {
    console.error('Error updating email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 }
    );
  }
}

// POST /api/user/email-preferences/test - Send test email
export async function POST(request) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const body = await request.json();
    const { type } = body;

    if (!type || !['weekly', 'monthly'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid email type (weekly or monthly) is required' },
        { status: 400 }
      );
    }

    const { default: emailService } = await import('../../../../lib/emailService');
    
    // Create test summary data
    const testSummary = {
      week_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      week_end: new Date(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      avg_mood_emoji: '😊',
      avg_mood_rate: 4.2,
      overall_wellness_score: 4.5,
      total_journals: 5,
      total_perspective_sessions: 3,
      total_mood_entries: 7,
      total_weekly_summaries: type === 'monthly' ? 4 : 0,
      dominant_theme: 'Self-discovery and growth',
      growth_insights: [
        'You maintained consistent journaling habits this week',
        'Your mood patterns show positive trends',
        'You\'re developing better self-awareness'
      ],
      achievement_highlights: [
        'Completed 5 journal entries',
        'Maintained daily mood tracking',
        'Explored new perspectives through sessions'
      ],
      challenges_faced: [
        'Some days showed lower energy levels',
        'Opportunities for deeper self-reflection'
      ],
      ai_summary: 'This test summary demonstrates the detailed insights you\'ll receive in your email reports.',
      short_summary: 'Test: Your wellness journey shows great progress with consistent engagement.',
      detailed_summary: 'Test detailed summary: This is a comprehensive analysis of your wellness activities, mood patterns, and personal growth over the test period.',
      recommendations: [
        'Continue your daily reflection practice',
        'Try new mindfulness techniques',
        'Set specific wellness goals for next period'
      ]
    };

    let result;
    if (type === 'weekly') {
      result = await emailService.sendWeeklySummaryEmail(user.id, testSummary);
    } else {
      result = await emailService.sendMonthlySummaryEmail(user.id, testSummary);
    }

    return NextResponse.json({
      message: `Test ${type} email ${result.success ? 'sent successfully' : 'failed to send'}`,
      result
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
