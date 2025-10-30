import { NextResponse } from 'next/server';
import notificationService from '../../../../lib/notificationService';

// POST /api/notifications/process-scheduled - Process scheduled notifications
// This endpoint should be called by a cron job periodically
export async function POST(request) {
  try {
    // For security, you might want to add a cron job secret verification
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_JOB_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const processedCount = await notificationService.processScheduledNotifications();
    
    return NextResponse.json({
      success: true,
      processed: processedCount,
      message: `Processed ${processedCount} scheduled notifications`
    });

  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled notifications' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/process-scheduled - Check endpoint status
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Scheduled notification processing endpoint is ready',
    usage: 'Send POST request to process scheduled notifications'
  });
}
