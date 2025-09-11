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

    const journalContent = `**Original Situation:**\n${session.user_input}\n\n**Perspective Insights:**\n\n${cardsContent}`;
    const journalTitle = `Perspective Session - ${new Date().toLocaleDateString()}`;
    const journalSummary = `Gained new perspectives on challenges through guided reflection and insights.`;

    // Calculate points based on content length and session completion
    const basePoints = 25; // Base points for saving to journal
    const contentBonus = Math.min(Math.floor(journalContent.length / 20), 25);
    const totalPoints = basePoints + contentBonus;

    const journal = await prisma.journal.create({
      data: {
        user_id: user.id,
        date: session.date,
        mood_emoji: '🧠', // Brain emoji for perspective sessions
        title: journalTitle,
        content: journalContent,
        summary: journalSummary,
        points_earned: totalPoints,
        tags: JSON.stringify(['perspective', 'growth', 'mindset', 'reflection'])
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
        total_points: { increment: totalPoints }
      }
    });

    return NextResponse.json({
      success: true,
      journalId: journal.id,
      pointsEarned: totalPoints,
      message: 'Perspective session saved to journal successfully'
    });

  } catch (error) {
    console.error('Error saving session to journal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}