import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../lib/authUtils';

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

    // Test email service directly
    const { default: emailService } = await import('../../../lib/emailService');
    
    console.log('🔍 Testing email service configuration...');
    console.log('📧 Service configured:', emailService.isConfigured);
    console.log('📧 Provider:', emailService.provider);

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

    console.log('📧 Final email result:', result);

    return NextResponse.json({
      message: `Test ${type} email ${result.success ? 'sent successfully' : 'failed to send'}`,
      result,
      debug: {
        serviceConfigured: emailService.isConfigured,
        provider: emailService.provider,
        userId: user.id
      }
    });

  } catch (error) {
    console.error('Error in test email endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to test email', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Email test endpoint is ready',
    usage: 'Send POST request with { "type": "weekly" or "monthly" } to test email functionality',
    environment: {
      sendgridConfigured: !!process.env.SENDGRID_API_KEY,
      sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || 'not set'
    }
  });
}
