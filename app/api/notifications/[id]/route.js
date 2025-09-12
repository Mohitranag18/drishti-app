import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../../../../lib/auth';

const prisma = new PrismaClient();

// PUT /api/notifications/[id] - Update a notification (mark as read, etc.)
export async function PUT(request, { params }) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { is_read } = body;

    // First check if the notification belongs to the user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: id,
        user_id: user.id
      }
    });

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: id },
      data: {
        is_read: is_read !== undefined ? is_read : existingNotification.is_read,
      }
    });

    return NextResponse.json(updatedNotification);

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete a notification
export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const { id } = params;

    // First check if the notification belongs to the user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: id,
        user_id: user.id
      }
    });

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
