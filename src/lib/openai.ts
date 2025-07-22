import { OpenAI } from "openai";

interface PlanetaryData {
  name?: string;
  fullDegree: number;
  normDegree: number;
  isRetro: string;
  current_sign: number;
  value?: number;
}

type AstroDetails = Array<{
  [key: string]: PlanetaryData;
}>;

interface DestinyCard {
  card: string;
  rank: string;
  suit: string;
  suitSymbol: string;
  description: string;
}

interface UserData {
  astroDetails?: AstroDetails;
  destinyCard?: DestinyCard;
  birthData?: {
    year: number;
    month: number;
    date: number;
    hours: number;
    minutes: number;
  };
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateResponse(
  message: string, 
  userData?: UserData,
  contextType: 'astro' | 'destiny' | 'combined' = 'astro'
) {

  console.log("userData",userData);
  try {
    // Check if this is a comprehensive profile synthesis request
    const isProfileSynthesis = message.includes('5-paragraph') || message.includes('comprehensive') || message.includes('synthesis');
    
    let systemPrompt: string = '';

    const isDestiny = message.toLowerCase().includes('destiny card');

    // Context 1: Destiny Cards only
    if (contextType === 'destiny' || isDestiny) {
      systemPrompt = `You are a master Cardologer specialising in the Destiny Cards (a divination system that maps birthdays to the 52-card deck). 

Guidelines:
✅ Always reference cards using standard playing-card notation (e.g., "8♣", "K♥").
✅ Explain the Birth Card and Planetary Ruling Card when relevant.
✅ Offer practical life guidance based on the meanings of those cards.
✅ If the user provides a context message, use it to generate a more accurate reading.


❌ Do NOT mention zodiac signs, planets, gates, or Human Design terminology.
❌ Keep responses concise (≤100 words unless user asks for detail).
`;

      // Add destiny card context if available
     if(userData?.destinyCard) {
      systemPrompt += `\n\nUser's Destiny Card: ${userData.destinyCard.card} (${userData.destinyCard.rank} of ${userData.destinyCard.suit})
Description: ${userData.destinyCard.description}`;
     }
     

    // Context 2: Astrology only
    } else if (contextType === 'astro') {
      systemPrompt = `You are TrueNorth, an AI assistant specializing in astrology and spiritual guidance. You provide insightful, compassionate, and personalized readings based on astrological data.

Key traits:
- Speak in a warm, understanding, and mystical tone
- ${isProfileSynthesis ? 'Provide detailed, comprehensive insights (150-200 words per paragraph)' : 'Keep responses SHORT and concise (under 100 words)'}
- Be direct and focused in your insights
- ${isProfileSynthesis ? 'Structure your response clearly with distinct sections' : 'Ask follow-up questions to keep conversation flowing'}
- Offer practical advice alongside spiritual guidance
- Be encouraging and positive while remaining authentic

${isProfileSynthesis ? 'For comprehensive synthesis requests, provide exactly 5 substantial paragraphs as requested, each focusing on the specific topic outlined.' : 'IMPORTANT: Always keep your responses brief and to the point. Users prefer quick, digestible insights over long explanations.'}

FEEDBACK HANDLING: If the user provides feedback (👍👎✏️), acknowledge it gracefully and:
- For positive feedback: Express gratitude and continue being helpful
- For improvement suggestions: Thank them, acknowledge the specific issue mentioned, and provide an improved response that addresses their concern
- For corrections: Acknowledge the correction, apologize briefly, and immediately provide the corrected information without asking for clarification

When responding to feedback with comments, focus on SOLVING the issue rather than asking what went wrong - the user has already told you what needs fixing.`;

      // Add astrological context if available (only for regular chat – skip for large synthesis to save tokens)
      if (userData?.astroDetails && !isProfileSynthesis) {
        systemPrompt += `\n\nUser's Birth Chart Data:`;
        
        // Use the second object in the array (index 1) which has cleaner planet names
        const planetsData = userData.astroDetails[1];
        if (planetsData) {
          const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
          
          Object.keys(planetsData).forEach(key => {
            const planetData = planetsData[key];
            if (planetData.name && planetData.current_sign !== undefined && planetData.normDegree !== undefined) {
              const signName = zodiacSigns[planetData.current_sign - 1] || 'Unknown';
              systemPrompt += `\n${planetData.name}: ${planetData.normDegree.toFixed(1)}° ${signName}${planetData.isRetro === 'true' ? ' (Retrograde)' : ''}`;
            }
          });
        }

        if (userData?.birthData) {
          systemPrompt += `\n\nUser's Birth Data: ${userData.birthData.year}-${userData.birthData.month}-${userData.birthData.date} ${userData.birthData.hours}:${userData.birthData.minutes}:00`;
        }
      }

    // Context 3: Combined Astro + Destiny
    } else if (contextType === 'combined') {
      systemPrompt = `You are TrueNorth, an AI assistant specializing in the synthesis of Astrology and Destiny Cards. You provide integrated insights that combine both systems for comprehensive spiritual guidance.

Key traits:
- Speak in a warm, understanding, and mystical tone
- ${isProfileSynthesis ? 'Provide detailed, comprehensive insights (150-200 words per paragraph)' : 'Keep responses SHORT and concise (under 100 words)'}
- Integrate both astrological and destiny card insights seamlessly
- ${isProfileSynthesis ? 'Structure your response clearly with distinct sections' : 'Ask follow-up questions to keep conversation flowing'}
- Offer practical advice alongside spiritual guidance
- Be encouraging and positive while remaining authentic

${isProfileSynthesis ? 'For comprehensive synthesis requests, provide exactly 5 substantial paragraphs as requested, each focusing on the specific topic outlined.' : 'IMPORTANT: Always keep your responses brief and to the point. Users prefer quick, digestible insights over long explanations.'}

FEEDBACK HANDLING: If the user provides feedback (👍👎✏️), acknowledge it gracefully and:
- For positive feedback: Express gratitude and continue being helpful
- For improvement suggestions: Thank them, acknowledge the specific issue mentioned, and provide an improved response that addresses their concern
- For corrections: Acknowledge the correction, apologize briefly, and immediately provide the corrected information without asking for clarification

When responding to feedback with comments, focus on SOLVING the issue rather than asking what went wrong - the user has already told you what needs fixing.`;

      // Add astrological context
      if (userData?.astroDetails && !isProfileSynthesis) {
        systemPrompt += `\n\nUser's Birth Chart Data:`;
        
        // Use the second object in the array (index 1) which has cleaner planet names
        const planetsData = userData.astroDetails[1];
        if (planetsData) {
          const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
          
          Object.keys(planetsData).forEach(key => {
            const planetData = planetsData[key];
            if (planetData.name && planetData.current_sign !== undefined && planetData.normDegree !== undefined) {
              const signName = zodiacSigns[planetData.current_sign - 1] || 'Unknown';
              systemPrompt += `\n${planetData.name}: ${planetData.normDegree.toFixed(1)}° ${signName}${planetData.isRetro === 'true' ? ' (Retrograde)' : ''}`;
            }
          });
        }
      }

      // Add destiny card context
      if (userData?.destinyCard) {
        systemPrompt += `\n\nUser's Destiny Card: ${userData.destinyCard.card} (${userData.destinyCard.rank} of ${userData.destinyCard.suit})
Description: ${userData.destinyCard.description}`;
      }
    }

    systemPrompt += `\n\nUser's please provide data w.r.t today's date and time.`;


    console.log("systemPrompt",contextType, systemPrompt);

    const response = await openai.chat.completions.create({
      model: isProfileSynthesis ? "gpt-3.5-turbo-0125" : "gpt-4o-mini", // faster model for synthesis
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.6,
      max_tokens: isProfileSynthesis ? 700 : 150, // reduced token count for synthesis
    });

    const aiResponse = response.choices[0]?.message?.content || "I apologize, but I'm having trouble connecting to my cosmic insights right now. Please try again.";
    
    return aiResponse;
  } catch (error) {
    throw error;
  }
} 