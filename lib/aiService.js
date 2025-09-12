// lib/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'your-api-key-here');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate journal content for perspective sessions
 */
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

/**
 * Generate journal content for manual entries
 */
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
