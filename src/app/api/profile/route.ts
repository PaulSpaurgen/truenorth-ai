import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { generateResponse } from '@/lib/openai';
import type { DecodedIdToken } from 'firebase-admin/auth';

interface AstroData {
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
    observation_point: 'topocentric' | 'geocentric';
    ayanamsha: 'lahiri' | 'raman' | 'krishnamurti' | 'sayan';
  };
}

// Cache for storing profile data (in production, use Redis or database)
interface CacheEntry {
  data: ProfileData;
  timestamp: number;
}

interface ProfileData {
  natalChart: Record<string, unknown>;
  currentTransits: Record<string, unknown>;
  synthesis: string;
  generatedAt: string;
  nextUpdate: string;
}

const profileCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const GET = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    console.log('Profile API called for user:', user.uid);
    const uid = user.uid;
    const now = new Date();
    
    // Check cache first
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const cacheKey = `${uid}-${today}`;
    const cached = profileCache.get(cacheKey);
    
    if (cached && (now.getTime() - cached.timestamp) < CACHE_DURATION) {
      console.log('Returning cached profile data');
      return NextResponse.json({
        success: true,
        profile: cached.data,
        cached: true
      });
    }

    // Run database connection and user fetch in parallel with current time setup
    const [, userData] = await Promise.all([
      dbConnect(),
      User.findOne({ uid })
    ]);

    console.log('User data found:', !!userData, 'Has astroDetails:', !!userData?.astroDetails);
    
    if (!userData || !userData.astroDetails) {
      return NextResponse.json(
        { error: 'No birth chart data found. Please complete your profile first.' },
        { status: 400 }
      );
    }

    const natalData = userData.astroDetails;
    
    // Prepare current transit data
    const currentAstroData: AstroData = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      date: now.getDate(),
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      latitude: natalData.input.latitude,
      longitude: natalData.input.longitude,
      timezone: natalData.input.timezone,
      settings: natalData.input.settings
    };

    // Run API call and AI synthesis in parallel
    const [currentTransits, synthesis] = await Promise.all([
      // Fetch current planetary positions
      fetch('https://json.freeastrologyapi.com/planets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ASTROLOGY_API_KEY || 'YOUR_API_KEY_HERE'
        },
        body: JSON.stringify(currentAstroData)
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch current planetary data: ${response.status}`);
        }
        return response.json();
      }),

      // Generate synthesis with optimized prompt
      generateResponse(
        `Create a comprehensive 5-paragraph astrological synthesis for this person born ${natalData.input.date}/${natalData.input.month}/${natalData.input.year}.

Key natal positions: ${JSON.stringify(extractKeyPlacements(natalData), null, 2)}

Current date: ${now.toDateString()}

Provide exactly 5 focused paragraphs (100-150 words each):
1. **Core Identity**: Sun, Moon, Ascendant analysis
2. **Relationships**: Venus, Mars emotional patterns  
3. **Career Path**: Midheaven, Saturn, Jupiter guidance
4. **Current Phase**: Major transits and themes for ${now.toDateString()}
5. **Practical Advice**: Actionable guidance for the next 3 months

Be insightful but concise.`,
        undefined,
        natalData
      )
    ]);

    const profileData = {
      natalChart: natalData,
      currentTransits: currentTransits,
      synthesis: synthesis,
      generatedAt: now.toISOString(),
      nextUpdate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    };

    // Cache the result
    profileCache.set(cacheKey, {
      data: profileData,
      timestamp: now.getTime()
    });

    return NextResponse.json({
      success: true,
      profile: profileData
    });

  } catch (error) {
    console.error('Error in profile route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate profile synthesis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

// Helper function to extract key planetary placements for faster processing
function extractKeyPlacements(natalData: Record<string, unknown>) {
  const output = (natalData.output as Record<string, unknown>[])?.[0] || {};
  const keyPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Ascendant'];
  
  const extracted: Record<string, { sign: number; degree: number; isRetro: boolean }> = {};
  Object.keys(output).forEach(key => {
    const planet = output[key] as Record<string, unknown>;
    if (planet?.name && keyPlanets.includes(planet.name as string)) {
      extracted[planet.name as string] = {
        sign: planet.current_sign as number,
        degree: Math.round((planet.normDegree as number) * 100) / 100,
        isRetro: planet.isRetro === 'true'
      };
    }
  });
  
  return extracted;
} 