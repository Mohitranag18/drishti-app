import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authenticateUser } from '../../../../lib/auth';

export async function GET(request) {
  try {
    // Authenticate user
    const { user, error } = await authenticateUser(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get completed perspective sessions count
    const completedSessions = await prisma.perspectiveSession.count({
      where: {
        user_id: user.id,
        status: 'completed'
      }
    });

    // Get journal entries for streak calculation
    const recentEntries = await prisma.journal.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: 30,
      select: {
        created_at: true,
        date: true
      }
    });

    // Calculate current streak
    let currentStreak = 0;
    const uniqueDates = [...new Set(recentEntries.map(entry => 
      entry.date.toISOString().split('T')[0]
    ))].sort().reverse();

    if (uniqueDates.length > 0) {
      let currentDate = new Date(today);
      let streakDate = uniqueDates[0];
      
      if (streakDate === today) {
        currentStreak = 1;
        currentDate.setDate(currentDate.getDate() - 1);
        
        for (let i = 1; i < uniqueDates.length; i++) {
          const expectedDate = currentDate.toISOString().split('T')[0];
          if (uniqueDates[i] === expectedDate) {
            currentStreak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
      } else {
        // Check if yesterday has an entry
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (streakDate === yesterdayStr) {
          currentStreak = 1;
          currentDate.setDate(currentDate.getDate() - 2);
          
          for (let i = 1; i < uniqueDates.length; i++) {
            const expectedDate = currentDate.toISOString().split('T')[0];
            if (uniqueDates[i] === expectedDate) {
              currentStreak++;
              currentDate.setDate(currentDate.getDate() - 1);
            } else {
              break;
            }
          }
        }
      }
    }

    // Get total points
    const totalPoints = await prisma.journal.aggregate({
      where: { user_id: user.id },
      _sum: {
        points_earned: true
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        completedSessions,
        currentStreak,
        totalPoints: totalPoints._sum.points_earned || 0
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
