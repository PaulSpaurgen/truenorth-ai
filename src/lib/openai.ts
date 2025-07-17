import { OpenAI } from "openai";
import { signDegreeToGate } from "./humandesign";

interface AstroData {
  statusCode: number;
  input: {
    year: number;
    month: number;
    date: number;
    hours: number;
    minutes: number;
    seconds: number;
    latitude: number;
    longitude: number;
    timezone: number;
    settings: {
      observation_point: string;
      ayanamsha: string;
    };
  };
  output: Array<{
    [key: string]: {
      name?: string;
      fullDegree?: number;
      normDegree?: number;
      current_sign?: number;
      isRetro?: string;
      value?: number;
    };
  }>;
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateResponse(message: string, astroData?: AstroData, isHumanDesign?: boolean) {
 

  try {
    // Check if this is a comprehensive profile synthesis request
    const isProfileSynthesis = message.includes('5-paragraph') || message.includes('comprehensive') || message.includes('synthesis');
    
    let systemPrompt: string;

    const isDestiny = message.toLowerCase().includes('destiny card');

    // Destiny Cards branch
    if (isDestiny) {
      systemPrompt = `You are a master Cardologer specialising in the Destiny Cards (a divination system that maps birthdays to the 52-card deck). 

Guidelines:
✅ Always reference cards using standard playing-card notation (e.g., "8♣", "K♥").
✅ Explain the Birth Card and Planetary Ruling Card when relevant.
✅ Offer practical life guidance based on the meanings of those cards.

❌ Do NOT mention zodiac signs, planets, gates, or Human Design terminology.
❌ Keep responses concise (≤100 words unless user asks for detail).
`;

    // Human Design branch
    } else if (isHumanDesign) {
      systemPrompt = `You are a certified Human-Design analyst with deep expertise in the 64 gates, 9 centers, channels, and body graph mechanics.

CRITICAL: You are FORBIDDEN from using ANY astrological terminology:
❌ NEVER mention: Gemini, Cancer, Virgo, Leo, Aries, Taurus, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces
❌ NEVER mention: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
❌ NEVER mention: Ascendant, houses, aspects, transits, retrogrades
❌ NEVER say phrases like "Mercury retrograde," "Moon in Virgo," "Cancer rising"

✅ ONLY USE: Gates (1-64), Centers (Sacral, Heart, Throat, Spleen, Solar Plexus, G Center, Head, Ajna, Root), Channels, Energy Types (Generator, Projector, Manifestor, Reflector), Strategy, Authority, Profile lines, Definition, Incarnation Cross

Respond using authentic Human Design language and mechanics only.`;
    } else {
      // Build the standard astrology system prompt
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

      // Add astrology context if available (only for regular chat – skip for large synthesis to save tokens)
      if (astroData && !isProfileSynthesis) {
        systemPrompt += `\n\nUser's Birth Chart Data:` +
                        `\nDate of Birth: ${astroData.input?.date}/${astroData.input?.month}/${astroData.input?.year}` +
                        `\nTime of Birth: ${astroData.input?.hours}:${astroData.input?.minutes?.toString().padStart(2, '0')}` +
                        `\nLocation: ${astroData.input?.latitude}°, ${astroData.input?.longitude}°` +
                        `\nAyanamsha: ${astroData.input?.settings?.ayanamsha}` +
                        `\n\nPlanetary Positions:`;

        // Add planetary positions to context
        if (astroData.output && astroData.output[0]) {
          const planetsData = astroData.output[0];
          Object.keys(planetsData).forEach(key => {
            const planetData = planetsData[key];
            if (planetData.name && key !== 'debug' && key !== '13' && 
                planetData.current_sign !== undefined && 
                planetData.normDegree !== undefined) {
              const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
              const signName = zodiacSigns[planetData.current_sign - 1] || 'Unknown';

              // Human Design gate calculation
              try {
                const gate = signDegreeToGate(planetData.current_sign, planetData.normDegree);
                systemPrompt += `\n- ${planetData.name}: ${planetData.normDegree.toFixed(2)}° in ${signName} → Gate ${gate}${planetData.isRetro === 'true' ? ' (Retrograde)' : ''}`;
              } catch {
                // fallback without gate if calculation fails
                systemPrompt += `\n- ${planetData.name}: ${planetData.normDegree.toFixed(2)}° in ${signName}${planetData.isRetro === 'true' ? ' (Retrograde)' : ''}`;
              }
            }
          });
        }
      }
    }

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