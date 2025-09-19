import { authenticateUser } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { user, error } = await authenticateUser(request);
    
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // Return user with all necessary fields for profile
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified,
        total_points: user.total_points,
        current_streak: user.current_streak,
        longest_streak: user.longest_streak,
        sessions: user.sessions,
        push_notification: user.push_notification,
        dark_mode: user.dark_mode,
        wellness_reminders: user.wellness_reminders,
        weekly_summary: user.weekly_summary,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}