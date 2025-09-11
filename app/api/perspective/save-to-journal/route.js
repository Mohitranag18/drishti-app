// app/api/perspective/save-to-journal/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authenticateUser } from '../../../../lib/auth';

export async function POST(request) {
  try {
    // Authenticate user
    const { user, error } = await authenticateUser(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get session with cards
    const session = await prisma.perspectiveSession.findFirst({
      where: {
        id: sessionId,
        user_id: user.id
      },
      include: {
        cards: true
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.saved_to_journal) {
      return NextResponse.json({ error: 'Session already saved to journal' }, { status: 400 });
    }

    // Create journal entry
    const cardsContent = session.cards.map(card => 
      `**${card.title}**\n${card.content}`
    ).join('\n\n');

    const journalContent = `**Original Situation:**\n${session.user_input}\n\n**Perspective Insights:**\n${cardsContent}`;
    
    const journalSummary = `Perspective session insights for challenges and growth opportunities.`;

    const journal = await prisma.journal.create({
      data: {
        user_id: user.id,
        date: session.date,
        mood_emoji: '🧠', // Brain emoji for perspective sessions
        title: 'Perspective Session Insights',
        content: journalContent,
        summary: journalSummary,
        points_earned: 25, // Additional points for saving to journal
        tags: JSON.stringify(['perspective', 'growth', 'mindset'])
      }
    });

    // Update session to mark as saved
    await prisma.perspectiveSession.update({
      where: { id: sessionId },
      data: { saved_to_journal: true }
    });

    // Award additional points
    await prisma.user.update({
      where: { id: user.id },
      data: {
        total_points: { increment: 25 }
      }
    });

    return NextResponse.json({
      success: true,
      journalId: journal.id,
      pointsEarned: 25,
      message: 'Session saved to journal successfully'
    });

  } catch (error) {
    console.error('Error saving session to journal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}