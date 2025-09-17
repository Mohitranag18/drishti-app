import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authenticateUser } from '../../../../lib/auth';

// PUT /api/notifications/bulk - Bulk operations on notifications
export async function PUT(request) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Add retry logic for database operations
    let retries = 3;
    let result;
    
    while (retries > 0) {
      try {
        switch (action) {
          case 'mark_all_read':
            result = await prisma.notification.updateMany({
              where: {
                user_id: user.id,
                is_read: false
              },
              data: {
                is_read: true
              }
            });
            break;
            
          case 'delete_all_read':
            result = await prisma.notification.deleteMany({
              where: {
                user_id: user.id,
                is_read: true
              }
            });
            break;
            
          case 'delete_all':
            result = await prisma.notification.deleteMany({
              where: {
                user_id: user.id
              }
            });
            break;
            
          default:
            return NextResponse.json(
              { error: 'Invalid action' },
              { status: 400 }
            );
        }
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
      success: true,
      message: `Successfully ${action.replace('_', ' ')}`,
      count: result?.count || 0
    });

  } catch (error) {
    console.error('Error performing bulk notification operation:', error);
    
    if (error.message?.includes('Can\'t reach database server')) {
      return NextResponse.json(
        { error: 'Database temporarily unavailable' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
