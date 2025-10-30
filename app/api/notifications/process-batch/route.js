import { NextResponse } from 'next/server';
import notificationService from '../../../../lib/notificationService';

export async function POST(request) {
  try {
    // Authenticate cron job
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      processed: 0,
      created: 0,
      errors: 0,
      errorDetails: [],
      details: {
        scheduledProcessed: 0,
        weeklySummariesGenerated: 0,
        weeklySummaryNotifications: 0,
        remindersSetup: 0
      }
    };

    try {
      // 1. Process scheduled notifications (past due date)
      const scheduledProcessed = await notificationService.processScheduledNotifications();
      results.details.scheduledProcessed = scheduledProcessed;
      results.processed += scheduledProcessed;

      // 2. Generate weekly summaries (run on Sundays)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday
      let weeklySummariesGenerated = 0;
      
      if (dayOfWeek === 0) { // Sunday
        try {
          const weeklySummaryResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/weekly-summary/generate-batch`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.CRON_SECRET}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (weeklySummaryResponse.ok) {
            const weeklyData = await weeklySummaryResponse.json();
            weeklySummariesGenerated = weeklyData.results?.created || 0;
            results.details.weeklySummariesGenerated = weeklySummariesGenerated;
            results.created += weeklySummariesGenerated;
            
            // Send notifications for newly created weekly summaries
            const { prisma } = await import('../../../../lib/prisma');
            const recentWeeklySummaries = await prisma.weeklySummary.findMany({
              where: {
                created_at: {
                  gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
                }
              },
              include: {
                user: {
                  select: { id: true }
                }
              }
            });
            
            for (const weeklySummary of recentWeeklySummaries) {
              try {
                await notificationService.createWeeklySummaryNotification(
                  weeklySummary.user_id, 
                  weeklySummary
                );
                results.details.weeklySummaryNotifications++;
                results.created++;
              } catch (error) {
                console.error(`Error creating weekly summary notification for user ${weeklySummary.user_id}:`, error);
                results.errors++;
                results.errorDetails.push({
                  userId: weeklySummary.user_id,
                  action: 'weekly_summary_notification',
                  error: error.message
                });
              }
            }
          }
        } catch (error) {
          console.error('Error generating weekly summaries:', error);
          results.errors++;
          results.errorDetails.push({
            action: 'weekly_summaries',
            error: error.message
          });
        }
      }

      // 3. Setup automatic reminders for active users
      const { prisma } = await import('../../../../lib/prisma');
      
      // Get all active users (users with activity in last 7 days)
      const activeUsers = await prisma.user.findMany({
        where: {
          OR: [
            {
              moods: {
                some: {
                  date: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            },
            {
              journals: {
                some: {
                  date: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            },
            {
              perspective_sessions: {
                some: {
                  date: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            }
          ]
        },
        select: { id: true }
      });

      for (const user of activeUsers) {
        try {
          const setupReminders = await notificationService.setupAutomaticReminders(user.id);
          if (setupReminders.length > 0) {
            results.details.remindersSetup += setupReminders.length;
            results.created += setupReminders.length;
          }
        } catch (error) {
          console.error(`Error setting up reminders for user ${user.id}:`, error);
          results.errors++;
          results.errorDetails.push({
            userId: user.id,
            action: 'setup_reminders',
            error: error.message
          });
        }
      }

    } catch (error) {
      console.error('Error in notification batch processing:', error);
      results.errors++;
      results.errorDetails.push({
        error: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification batch processing completed',
      results
    });

  } catch (error) {
    console.error('Error in notification batch processing:', error);
    return NextResponse.json(
      { error: 'Failed to process notifications' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Notification batch processing endpoint is ready',
    usage: 'Send POST request with Authorization header to process notifications',
    cronExample: '0 * * * * curl -X POST https://your-domain.com/api/notifications/process-batch -H "Authorization: Bearer YOUR_CRON_SECRET"'
  });
}
