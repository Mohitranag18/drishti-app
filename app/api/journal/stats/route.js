// app/api/journal/stats/route.js
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

    // Get current date info
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Add retry logic for database operations
    let retries = 3;
    let totalEntries, favoriteEntries, weeklyEntries, monthlyEntries, recentEntries;
    
    while (retries > 0) {
      try {
        [
          totalEntries,
          favoriteEntries,
          weeklyEntries,
          monthlyEntries,
          recentEntries
        ] = await Promise.all([
          // Total entries
          prisma.journal.count({
            where: { user_id: user.id }
          }),
          
          // Favorite entries (entries with high points or specific tags)
          prisma.journal.count({
            where: {
              user_id: user.id,
              points_earned: { gte: 30 }
            }
          }),
          
          // Weekly entries
          prisma.journal.count({
            where: {
              user_id: user.id,
              created_at: { gte: startOfWeek }
            }
          }),
          
          // Monthly entries
          prisma.journal.count({
            where: {
              user_id: user.id,
              created_at: { gte: startOfMonth }
            }
          }),
          
          // Recent entries for streak calculation
          prisma.journal.findMany({
            where: { user_id: user.id },
            orderBy: { created_at: 'desc' },
            take: 30,
            select: {
              created_at: true,
              date: true
            }
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

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const uniqueDates = [...new Set((recentEntries || []).map(entry => 
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

    return NextResponse.json({
      totalEntries: totalEntries || 0,
      favoriteEntries: favoriteEntries || 0,
      weeklyEntries: weeklyEntries || 0,
      monthlyEntries: monthlyEntries || 0,
      currentStreak,
      stats: {
        thisWeek: weeklyEntries || 0,
        thisMonth: monthlyEntries || 0,
        allTime: totalEntries || 0
      }
    });

  } catch (error) {
    console.error('Error fetching journal stats:', error);
    
    // Return default values instead of error for better UX
    if (error.message?.includes('Can\'t reach database server')) {
      return NextResponse.json({
        totalEntries: 0,
        favoriteEntries: 0,
        weeklyEntries: 0,
        monthlyEntries: 0,
        currentStreak: 0,
        stats: {
          thisWeek: 0,
          thisMonth: 0,
          allTime: 0
        },
        error: 'Database temporarily unavailable'
      });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
