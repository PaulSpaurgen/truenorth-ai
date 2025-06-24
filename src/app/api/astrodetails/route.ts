import { NextResponse } from 'next/server';

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

export async function POST(req: Request) {
  try {
    const astroData: AstroData = await req.json();
    
    // Make request to Free Astrology API
    const response = await fetch('https://json.freeastrologyapi.com/planets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ASTROLOGY_API_KEY || 'YOUR_API_KEY_HERE'
      },
      body: JSON.stringify(astroData)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error calling astrology API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch astrology data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Keep the GET method for backward compatibility
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const date = searchParams.get('date');
    const hours = searchParams.get('hours');
    const minutes = searchParams.get('minutes');
    const seconds = searchParams.get('seconds');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const timezone = searchParams.get('timezone');
    const observation_point = searchParams.get('observation_point');
    const ayanamsha = searchParams.get('ayanamsha');

    return NextResponse.json({ year, month, date, hours, minutes, seconds, latitude, longitude, timezone, observation_point, ayanamsha });
}