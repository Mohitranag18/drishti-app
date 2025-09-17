import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { authenticateUser } from '../../../lib/auth';

// GET /api/notifications - Get all notifications for the current user
export async function GET(request) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const unreadOnly = searchParams.get('unread_only') === 'true';

    const whereClause = {
      user_id: user.id,
      ...(unreadOnly && { is_read: false })
    };

    // Add retry logic for database operations
    let retries = 3;
    let notifications, totalCount;
    
    while (retries > 0) {
      try {
        [notifications, totalCount] = await Promise.all([
          prisma.notification.findMany({
            where: whereClause,
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset,
          }),
          prisma.notification.count({
            where: whereClause,
          })
        ]);
        break; // Success, exit retry loop
      } catch (dbError) {
        retries--;
        if (retries === 0) {
          throw dbError;
        }
        console.log(`Database query failed, retrying... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      notifications: notifications || [],
      totalCount: totalCount || 0,
      hasMore: offset + limit < (totalCount || 0)
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    // Return empty array instead of error for better UX
    if (error.message?.includes('Can\'t reach database server')) {
      return NextResponse.json({
        notifications: [],
        totalCount: 0,
        hasMore: false,
        error: 'Database temporarily unavailable'
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, type, scheduled_for } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Title, message, and type are required' },
        { status: 400 }
      );
    }

    const validTypes = ['tip', 'milestone', 'check_in', 'daily_reflection', 'task_reminder', 'achievement', 'reminder'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        user_id: user.id,
        title,
        message,
        type,
        scheduled_for: scheduled_for ? new Date(scheduled_for) : null,
        sent_at: scheduled_for ? null : new Date(),
      }
    });

    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
