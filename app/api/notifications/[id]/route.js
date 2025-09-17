import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authenticateUser } from '../../../../lib/auth';

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

    // Add retry logic for database operations
    let retries = 3;
    let existingNotification, updatedNotification;
    
    while (retries > 0) {
      try {
        // First check if the notification belongs to the user
        existingNotification = await prisma.notification.findFirst({
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

        updatedNotification = await prisma.notification.update({
          where: { id: id },
          data: {
            is_read: is_read !== undefined ? is_read : existingNotification.is_read,
          }
        });
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

    return NextResponse.json(updatedNotification);

  } catch (error) {
    console.error('Error updating notification:', error);
    
    if (error.message?.includes('Can\'t reach database server')) {
      return NextResponse.json(
        { error: 'Database temporarily unavailable' },
        { status: 503 }
      );
    }
    
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

    // Add retry logic for database operations
    let retries = 3;
    let existingNotification;
    
    while (retries > 0) {
      try {
        // First check if the notification belongs to the user
        existingNotification = await prisma.notification.findFirst({
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

    return NextResponse.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    console.error('Error deleting notification:', error);
    
    if (error.message?.includes('Can\'t reach database server')) {
      return NextResponse.json(
        { error: 'Database temporarily unavailable' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
