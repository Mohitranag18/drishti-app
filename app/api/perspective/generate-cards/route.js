import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../../../lib/prisma';
import { authenticateUser } from '../../../../lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // Verify session belongs to user and fetch all related data
    const session = await prisma.perspectiveSession.findFirst({
      where: {
        id: sessionId,
        user_id: user.id
      },
      include: {
        quizzes: true, // Include quiz questions and their answers
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Construct the context for Gemini based on user input and quiz answers
    let context = `User's initial situation: "${session.user_input}"\n\n`;
    context += "User's answers to understanding questions:\n";
    session.quizzes.forEach(quiz => {
      context += `- Question: "${quiz.question_text}"\n`;
      context += `  Answer: "${quiz.answer_text || quiz.emojis_option || quiz.scale_min || quiz.mcq_options}"\n`;
    });

    // Generate perspective cards using Gemini Pro
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `
    Based on the following context, generate 3 unique perspective cards. Each card should offer a different way to look at the situation, provide actionable advice, or highlight a key insight.
    
    Context:
    ${context}
    
    Return ONLY a valid JSON object with this exact structure:
    {
      "cards": [
        {
          "title": "Card Title 1",
          "content": "Detailed content for card 1, offering a new perspective or actionable advice.",
          "card_type": "growth" // Can be 'growth', 'compassion', 'action', or 'insight'
        },
        {
          "title": "Card Title 2",
          "content": "Detailed content for card 2, offering a new perspective or actionable advice.",
          "card_type": "compassion"
        },
        {
          "title": "Card Title 3",
          "content": "Detailed content for card 3, offering a new perspective or actionable advice.",
          "card_type": "action"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    let cardsData;
    try {
      // Clean the response by removing markdown code fences
      const cleanedResponse = response.replace(/^```json\s*|```$/g, '');
      cardsData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response for cards:', parseError);
      console.error('Raw response:', response);
      return NextResponse.json({ error: 'Failed to generate perspective cards' }, { status: 500 });
    }

    // Save cards to database
    const savedCards = [];
    for (const card of cardsData.cards) {
      const savedCard = await prisma.perspectiveCard.create({
        data: {
          session_id: sessionId,
          title: card.title,
          content: card.content,
          card_type: card.card_type || 'insight' // Default to 'insight' if not provided
        }
      });
      savedCards.push(savedCard);
    }

    // Update session status to completed
    await prisma.perspectiveSession.update({
      where: { id: sessionId },
      data: { status: 'completed', completed_at: new Date() }
    });

    // Award points for completing the session
    const pointsEarned = 50;
    await prisma.user.update({
      where: { id: user.id },
      data: { total_points: { increment: pointsEarned } }
    });

    return NextResponse.json({
      success: true,
      cards: savedCards,
      pointsEarned: pointsEarned,
      message: 'Perspective cards generated successfully'
    });

  } catch (error) {
    console.error('Error generating perspective cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
