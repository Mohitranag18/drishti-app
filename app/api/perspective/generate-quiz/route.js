// app/api/perspective/generate-quiz/route.js - With debugging
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../../../lib/prisma';
import { authenticateUser } from '../../../../lib/auth';

export async function POST(request) {
  try {
    // Debug: Check if API key exists
    console.log('🔍 GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('🔍 GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is missing from environment variables');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Authenticate user
    const { user, error } = await authenticateUser(request);
    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, userInput } = body;

    if (!sessionId || !userInput) {
      return NextResponse.json({ error: 'Session ID and user input are required' }, { status: 400 });
    }

    // Verify session belongs to user
    const session = await prisma.perspectiveSession.findFirst({
      where: {
        id: sessionId,
        user_id: user.id
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Generate quiz questions using Gemini Pro
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `
    Based on this user's situation: "${userInput}"
    
    Generate 4 different types of questions to better understand their situation:
    
    1. A text input question asking for more details
    2. A multiple choice question with 4 options about their feelings/situation
    3. A scale question (1-5) about intensity/frequency
    4. An emoji multiple choice question with 4 emoji options
    
    Return ONLY a valid JSON object with this exact structure:
    {
      "questions": [
        {
          "type": "text",
          "question": "question text",
          "placeholder": "placeholder text"
        },
        {
          "type": "multiple_choice",
          "question": "question text",
          "options": ["option1", "option2", "option3", "option4"]
        },
        {
          "type": "scale",
          "question": "question text",
          "min": 1,
          "max": 5,
          "minLabel": "low label",
          "maxLabel": "high label"
        },
        {
          "type": "emoji",
          "question": "question text", 
          "options": ["😞", "😤", "😊", "😌"]
        }
      ]
    }`;

    console.log('🔍 Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    console.log('✅ Received response from Gemini');
    
    const response = result.response.text();
    
    let quizData;
    try {
      // Clean the response by removing markdown code fences
      const cleanedResponse = response.replace(/^```json\s*|```$/g, '');
      quizData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', response);
      return NextResponse.json({ error: 'Failed to generate quiz questions' }, { status: 500 });
    }

    // Save questions to database
    const savedQuestions = [];
    for (const question of quizData.questions) {
      const savedQuestion = await prisma.perspectiveQuizz.create({
        data: {
          session_id: sessionId,
          question_type: question.type,
          question_text: question.question,
          answer_type: question.type,
          text_option: question.type === 'text' ? question.placeholder : null,
          emojis_option: question.type === 'emoji' ? JSON.stringify(question.options) : null,
          scale_min: question.type === 'scale' ? question.min : null,
          scale_max: question.type === 'scale' ? question.max : null,
          mcq_options: question.type === 'multiple_choice' ? JSON.stringify(question.options) : null
        }
      });
      
      savedQuestions.push({
        id: savedQuestion.id,
        type: question.type,
        question: question.question,
        placeholder: question.placeholder,
        options: question.options,
        min: question.min,
        max: question.max,
        minLabel: question.minLabel,
        maxLabel: question.maxLabel
      });
    }

    // Update session status
    await prisma.perspectiveSession.update({
      where: { id: sessionId },
      data: { status: 'understanding' }
    });

    return NextResponse.json({
      success: true,
      questions: savedQuestions,
      message: 'Quiz questions generated successfully'
    });

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
