import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    const { action, notification_ids } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const whereClause = {
      user_id: user.id,
      ...(notification_ids && { id: { in: notification_ids } })
    };

    let result;

    switch (action) {
      case 'mark_all_read':
        result = await prisma.notification.updateMany({
          where: whereClause,
          data: { is_read: true }
        });
        break;

      case 'mark_all_unread':
        result = await prisma.notification.updateMany({
          where: whereClause,
          data: { is_read: false }
        });
        break;

      case 'delete_all':
        result = await prisma.notification.deleteMany({
          where: whereClause
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Successfully ${action.replace('_', ' ')}d notifications`,
      count: result.count
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
