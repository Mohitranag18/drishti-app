import { NextResponse } from 'next/server';
import notificationService from '../../../../lib/notificationService';

// POST /api/notifications/process-scheduled - Process scheduled notifications (cron job)
export async function POST(request) {
  try {
    // You can add authentication here if needed
    // For now, we'll process all scheduled notifications
    
    const processedCount = await notificationService.processScheduledNotifications();
    
    return NextResponse.json({
      message: 'Scheduled notifications processed successfully',
      count: processedCount
    });

  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled notifications' },
      { status: 500 }
    );
  }
}
