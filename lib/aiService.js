import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY || 'your-api-key-here'});

// Schema for perspective journal response
const perspectiveJournalSchema = {
  name: "generatePerspectiveJournalContent",
  description: "Generates journal entry from perspective session",
  parametersJsonSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      content: { type: "string" },
      summary: { type: "string" },
      mood_emoji: { 
        type: "string", 
        enum: ["😊", "😐", "😔", "😟", "🧠", "❤️", "✨", "😴", "😤", "🤔"] 
      },
      tags: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 4
      }
    },
    required: ["title", "content", "summary", "mood_emoji", "tags"]
  }
};

export async function generatePerspectiveJournalContent(sessionData) {
  try {
    const { userInput, quizzes, cards } = sessionData;
    
    const prompt = `
You are creating a personal journal entry based on a perspective session. Write this as if the person is reflecting on their experience.

Session Data:
- Original situation: "${userInput}"
- Quiz responses: ${JSON.stringify(quizzes, null, 2)}
- Insight cards: ${JSON.stringify(cards, null, 2)}

Create a realistic journal entry that:
1. **Title**: A personal, reflective title (max 50 characters) - something the person would actually write
2. **Content**: A natural journal entry (150-300 words) that:
   - Starts with the original situation in their own words
   - Incorporates insights from the cards naturally
   - Includes learnings from quiz responses
   - Uses first person ("I", "me", "my")
   - Sounds like a real person writing in their diary
   - Avoids overly formal or AI-like language
   - Focuses on personal reflection, not generic advice
3. **Summary**: A brief 1-2 sentence summary (max 100 characters)
4. **Mood Emoji**: Choose the most appropriate: 😊, 😐, 😔, 😟, 🧠, ❤️, ✨, 😴, 😤, 🤔
5. **Tags**: 3-4 tags where first is one of: "happy", "neutral", "sad", "other"

Return JSON:
{
  "title": "string",
  "content": "string", 
  "summary": "string",
  "mood_emoji": "string",
  "tags": ["string", "string", "string"]
}
`;

    // Generate structured response
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        tools: [{
          functionDeclarations: [perspectiveJournalSchema]
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY
          }
        }
      }
    });
    
    // Get structured data from function call
    const generatedData = result.functionCalls[0].args;
    
    // Validate and clean the response
    return {
      title: generatedData.title?.substring(0, 200) || 'Perspective Reflection',
      content: generatedData.content || 'Reflection on perspective session',
      summary: generatedData.summary?.substring(0, 100) || 'Gained new perspectives through guided reflection',
      mood_emoji: generatedData.mood_emoji || '🧠',
      tags: Array.isArray(generatedData.tags) ? generatedData.tags.slice(0, 4) : ['reflection', 'growth']
    };
    
  } catch (error) {
    console.error('Error generating perspective journal content:', error);
    
    // Fallback content - more natural
    const fallbackContent = `I had a perspective session today about: ${sessionData.userInput}

${sessionData.cards.map(card => `Key insight: ${card.title} - ${card.content}`).join('\n\n')}

This helped me see things differently and gave me some new ways to think about my situation.`;

    return {
      title: `Reflection - ${new Date().toLocaleDateString()}`,
      content: fallbackContent,
      summary: 'Gained new perspectives through guided reflection.',
      mood_emoji: '🧠',
      tags: ['reflection', 'growth', 'mindset']
    };
  }
}

export async function generateManualJournalContent(title, content) {
  try {
    const prompt = `
You are enhancing a personal journal entry. Analyze the title and content to generate metadata.

Journal Entry:
- Title: "${title}"
- Content: "${content}"

Generate:
1. **Summary**: A brief 1-2 sentence summary (max 100 characters)
2. **Mood Emoji**: Choose the most appropriate: 😊, 😐, 😔, ��, 🧠, ❤️, ✨, 😴, 😤, 🤔
3. **Tags**: 3-4 tags where first is one of: "happy", "neutral", "sad", "other"

Return JSON:
{
  "summary": "string",
  "mood_emoji": "string", 
  "tags": ["string", "string", "string"]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }
    
    const generatedData = JSON.parse(jsonMatch[0]);
    
    // Validate and clean the response
    return {
      summary: generatedData.summary?.substring(0, 100) || content.substring(0, 80) + '...',
      mood_emoji: generatedData.mood_emoji || '😐',
      tags: Array.isArray(generatedData.tags) ? generatedData.tags.slice(0, 4) : ['personal']
    };
    
  } catch (error) {
    console.error('Error generating manual journal content:', error);
    
    // Fallback content
    return {
      summary: content.length > 80 ? content.substring(0, 80) + '...' : content,
      mood_emoji: '😐',
      tags: ['personal']
    };
  }
}

export async function generateSmartRecommendations(userMood, userHistory, currentContext) {
  try {
    const prompt = `
You are a wellness AI assistant. Generate 3 personalized recommendations for the user based on their current state.

User Context:
- Current mood: ${userMood ? `${userMood.mood_emoji} (${userMood.mood_rate}/10)` : 'Not set today'}
- Activity level: ${userHistory.sessions || 0} perspective sessions, ${userHistory.journals || 0} journal entries
- Current streak: ${userHistory.current_streak || 0} days
- Context: ${currentContext || 'General wellness'}

Generate recommendations that are:
1. Actionable and specific
2. Appropriate for their current mood
3. Focused on mental wellness and self-care
4. Brief but meaningful

Return JSON format:
{
  "recommendations": [
    {
      "title": "Activity name",
      "description": "Brief description of the activity", 
      "action": "Action button text",
      "type": "category" // mindfulness, reflection, wellness, social, creative
    }
  ]
}
`;

    const recommendationSchema = {
      name: "generateRecommendations",
      description: "Generates personalized wellness recommendations",
      parametersJsonSchema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                action: { type: "string" },
                type: { 
                  type: "string",
                  enum: ["mindfulness", "reflection", "wellness", "social", "creative"]
                }
              },
              required: ["title", "description", "action", "type"]
            },
            minItems: 3,
            maxItems: 3
          }
        },
        required: ["recommendations"]
      }
    };
    
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        tools: [{
          functionDeclarations: [recommendationSchema]
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY
          }
        }
      }
    });
    
    const data = result.functionCalls[0].args;
    const recommendations = data.recommendations;
    
    return recommendations.recommendations || [];
    
  } catch (error) {
    console.error('Error generating smart recommendations:', error);
    return [];
  }
}

export async function analyzeDailyMood(moodData, journalData, sessionData) {
  try {
    const prompt = `
You are analyzing a user's daily emotional state to provide insights and mood scoring.

Daily Data:
- Mood emoji selected: ${moodData.mood_emoji || 'None'}
- Mood rating: ${moodData.mood_rate || 'Not provided'}/10
- Journal entries: ${journalData.length} entries
- Journal content: ${journalData.map(j => j.content.substring(0, 100)).join('; ')}
- Perspective sessions: ${sessionData.length} sessions
- Session content: ${sessionData.map(s => s.user_input.substring(0, 100)).join('; ')}

Analyze this data and provide:
1. Happiness score (1-10)
2. Sadness score (1-10) 
3. Anxiety score (1-10)
4. Energy score (1-10)
5. Loneliness score (1-10)
6. Overall wellness score (1-10)
7. Brief AI summary of the day (50 words max)

Return JSON:
{
  "happiness_score": number,
  "sadness_score": number,
  "anxiety_score": number,
  "energy_score": number,
  "loneliness_score": number,
  "overall_wellness": number,
  "ai_summary": "string",
  "key_insights": ["insight1", "insight2"]
}
`;

    const moodAnalysisSchema = {
      name: "analyzeDailyMood",
      description: "Analyzes daily emotional state to provide insights and scoring",
      parametersJsonSchema: {
        type: "object",
        properties: {
          happiness_score: { type: "number", minimum: 1, maximum: 10 },
          sadness_score: { type: "number", minimum: 1, maximum: 10 },
          anxiety_score: { type: "number", minimum: 1, maximum: 10 },
          energy_score: { type: "number", minimum: 1, maximum: 10 },
          loneliness_score: { type: "number", minimum: 1, maximum: 10 },
          overall_wellness: { type: "number", minimum: 1, maximum: 10 },
          ai_summary: { type: "string" },
          key_insights: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: [
          "happiness_score", "sadness_score", "anxiety_score", 
          "energy_score", "loneliness_score", "overall_wellness",
          "ai_summary", "key_insights"
        ]
      }
    };
    
    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        tools: [{
          functionDeclarations: [moodAnalysisSchema]
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY
          }
        }
      }
    });
    
    const analysis = result.functionCalls[0].args;
    
    return {
      happiness_score: Math.max(1, Math.min(10, analysis.happiness_score || 5)),
      sadness_score: Math.max(1, Math.min(10, analysis.sadness_score || 5)),
      anxiety_score: Math.max(1, Math.min(10, analysis.anxiety_score || 5)),
      energy_score: Math.max(1, Math.min(10, analysis.energy_score || 5)),
      loneliness_score: Math.max(1, Math.min(10, analysis.loneliness_score || 5)),
      overall_wellness: Math.max(1, Math.min(10, analysis.overall_wellness || 5)),
      ai_summary: analysis.ai_summary || 'A day of reflection and growth.',
      key_insights: analysis.key_insights || []
    };
    
  } catch (error) {
    console.error('Error analyzing daily mood:', error);
    
    // Fallback analysis based on mood emoji
    const defaultScores = getMoodScores(moodData.mood_emoji);
    
    return {
      happiness_score: defaultScores.happiness,
      sadness_score: defaultScores.sadness,
      anxiety_score: defaultScores.anxiety,
      energy_score: defaultScores.energy,
      loneliness_score: defaultScores.loneliness,
      overall_wellness: Math.round((defaultScores.happiness + defaultScores.energy) / 2),
      ai_summary: 'Daily mood analysis based on your check-in.',
      key_insights: ['Mood tracking helps build self-awareness']
    };
  }
}

/**
 * Get mood scores from emoji
 */
function getMoodScores(moodEmoji) {
  const moodMap = {
    '😊': { happiness: 9, sadness: 1, anxiety: 2, energy: 8, loneliness: 2 },
    '😁': { happiness: 10, sadness: 1, anxiety: 1, energy: 9, loneliness: 1 },
    '😐': { happiness: 5, sadness: 3, anxiety: 4, energy: 5, loneliness: 4 },
    '😔': { happiness: 2, sadness: 8, anxiety: 6, energy: 3, loneliness: 7 },
    '😟': { happiness: 3, sadness: 4, anxiety: 9, energy: 4, loneliness: 5 },
    '😴': { happiness: 4, sadness: 2, anxiety: 3, energy: 2, loneliness: 3 },
    '😤': { happiness: 3, sadness: 2, anxiety: 7, energy: 7, loneliness: 4 },
    '🤔': { happiness: 6, sadness: 2, anxiety: 3, energy: 6, loneliness: 3 },
    '🧠': { happiness: 7, sadness: 2, anxiety: 2, energy: 7, loneliness: 2 },
    '❤️': { happiness: 9, sadness: 1, anxiety: 1, energy: 8, loneliness: 1 },
    '✨': { happiness: 8, sadness: 1, anxiety: 2, energy: 9, loneliness: 2 }
  };
  
  return moodMap[moodEmoji] || { happiness: 5, sadness: 3, anxiety: 4, energy: 5, loneliness: 4 };
}
