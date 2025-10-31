import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { generateMonthlySummary } from '../../../../lib/aiService';
import { getDateNumbers } from '../../../../lib/journalUtils';
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
      updated: 0,
      errors: 0,
      errorDetails: [],
      monthlySummaryNotifications: 0
    };

    try {
      // Get all users who have activity in the last month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const activeUsers = await prisma.user.findMany({
        where: {
          OR: [
            {
              moods: {
                some: {
                  date: {
                    gte: oneMonthAgo
                  }
                }
              }
            },
            {
              journals: {
                some: {
                  date: {
                    gte: oneMonthAgo
                  }
                }
              }
            },
            {
              perspective_sessions: {
                some: {
                  date: {
                    gte: oneMonthAgo
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
          // Calculate the month date range (last completed month)
          const now = new Date();
          const currentMonth = now.getMonth(); // 0-11 (0 = January)
          
          // Calculate the start and end of the previous month
          let monthStart, monthEnd, month, year;
          
          if (currentMonth === 0) {
            // If we're in January, previous month is December of last year
            monthStart = new Date(now.getFullYear() - 1, 11, 1); // December 1 of last year
            monthEnd = new Date(now.getFullYear() - 1, 11, 31); // December 31 of last year
            month = 12;
            year = now.getFullYear() - 1;
          } else {
            // Otherwise, previous month is current month - 1
            const previousMonth = currentMonth - 1;
            monthStart = new Date(now.getFullYear(), previousMonth, 1);
            // Get last day of previous month
            const lastDayOfMonth = new Date(now.getFullYear(), currentMonth, 0).getDate();
            monthEnd = new Date(now.getFullYear(), previousMonth, lastDayOfMonth);
            month = previousMonth;
            year = now.getFullYear();
          }

          // Check if monthly summary already exists
          const existingSummary = await prisma.MonthlySummary.findFirst({
            where: {
              user_id: user.id,
              month: month,
              year: year
            }
          });

          if (existingSummary) {
            results.processed++;
            continue;
          }

          // Get all data for this month
          const [weeklySummaries, dailySummaries, journals, perspectiveSessions, moods] = await Promise.all([
            prisma.weeklySummary.findMany({
              where: {
                user_id: user.id,
                month: month,
                year: year
              },
              orderBy: { week: 'asc' }
            }),
            prisma.dailySummary.findMany({
              where: {
                user_id: user.id,
                date: {
                  gte: monthStart,
                  lte: monthEnd
                }
              },
              orderBy: { date: 'asc' }
            }),
            prisma.journal.findMany({
              where: {
                user_id: user.id,
                date: {
                  gte: monthStart,
                  lte: monthEnd
                }
              },
              orderBy: { date: 'asc' }
            }),
            prisma.perspectiveSession.findMany({
              where: {
                user_id: user.id,
                date: {
                  gte: monthStart,
                  lte: monthEnd
                }
              },
              orderBy: { date: 'asc' }
            }),
            prisma.mood.findMany({
              where: {
                user_id: user.id,
                date: {
                  gte: monthStart,
                  lte: monthEnd
                }
              },
              orderBy: { date: 'asc' }
            })
          ]);

          // Skip if no activity for the month
          if (weeklySummaries.length === 0 && dailySummaries.length === 0 && journals.length === 0 && perspectiveSessions.length === 0 && moods.length === 0) {
            results.processed++;
            continue;
          }

          // Generate AI monthly summary
          const monthlyData = {
            weeklySummaries,
            dailySummaries,
            journals,
            perspectiveSessions,
            moods,
            monthStart,
            monthEnd
          };

          const aiSummary = await generateMonthlySummary(monthlyData);

          // Calculate averages and totals
          const avgMoodRate = moods.length > 0 
            ? moods.reduce((sum, mood) => sum + (mood.mood_rate || 5), 0) / moods.length 
            : null;

          const overallWellnessScore = dailySummaries.length > 0
            ? dailySummaries.reduce((sum, ds) => sum + (ds.overall_wellness || 5), 0) / dailySummaries.length
            : null;

          // Create monthly summary
          const monthlySummary = await prisma.MonthlySummary.create({
            data: {
              user_id: user.id,
              month_start: monthStart,
              month_end: monthEnd,
              month,
              year,
              avg_mood_emoji: moods.length > 0 ? 
                moods.sort((a, b) => (b.mood_rate || 5) - (a.mood_rate || 5))[0].mood_emoji : null,
              avg_mood_rate: avgMoodRate,
              overall_wellness_score: overallWellnessScore,
              total_journals: journals.length,
              total_perspective_sessions: perspectiveSessions.length,
              total_mood_entries: moods.length,
              total_weekly_summaries: weeklySummaries.length,
              dominant_theme: aiSummary.dominant_theme,
              growth_insights: aiSummary.growth_insights,
              achievement_highlights: aiSummary.achievement_highlights,
              challenges_faced: aiSummary.challenges_faced,
              ai_summary: aiSummary.detailed_summary,
              short_summary: aiSummary.short_summary,
              detailed_summary: aiSummary.detailed_summary,
              recommendations: aiSummary.recommendations,
              weekly_summary_ids: weeklySummaries.map(ws => ws.id),
              journal_ids: journals.map(j => j.id),
              session_ids: perspectiveSessions.map(s => s.id),
              mood_ids: moods.map(m => m.id),
              daily_summary_ids: dailySummaries.map(ds => ds.id)
            }
          });

          // Send notification for the monthly summary
          try {
            await notificationService.createMonthlySummaryNotification(user.id, monthlySummary);
            results.monthlySummaryNotifications++;
          } catch (notificationError) {
            console.error(`Error sending monthly summary notification for user ${user.id}:`, notificationError);
            // Don't fail the whole process if notification fails, just log it
          }

          results.created++;
          results.processed++;

        } catch (error) {
          console.error(`Error processing monthly summary for user ${user.id}:`, error);
          results.errors++;
          results.errorDetails.push({
            userId: user.id,
            error: error.message
          });
          results.processed++;
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Monthly summary generation completed',
        results
      });

    } catch (error) {
      console.error('Error in batch monthly summary generation:', error);
      return NextResponse.json(
        { error: 'Failed to generate monthly summaries' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Monthly summary generation endpoint is ready',
    usage: 'Send POST request with Authorization header to generate monthly summaries',
    cronExample: '0 0 1 * * curl -X POST https://your-domain.com/api/monthly-summary/generate-batch -H "Authorization: Bearer YOUR_CRON_SECRET"'
  });
}
