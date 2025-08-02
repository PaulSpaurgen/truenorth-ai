import { dbConnect } from '@/lib/services/mongodb';
import { withAuth } from '@/lib/services/withAuth';
import { NextResponse } from 'next/server';
import User from '@/models/User';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getDestinyCard } from '@/lib/services/destinyCards';
import { generateNatalChartData, generateNatalChartReport } from '@/lib/services/astroCalculation';

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

export const POST = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    const uid = user.uid;
    const astroData: AstroData = await req.json();
    const destinyCard = getDestinyCard(astroData.month, astroData.date);
    const natalChartData = generateNatalChartData(astroData);
    const natalChartSummary = generateNatalChartReport(astroData);
    
    await dbConnect();
    const userData = await User.findOne({ uid });

    if (natalChartData) {
      await User.updateOne(
        { uid },
        { $set: { 
          astroDetails: natalChartData , 
          astroDetailsAsString: natalChartSummary,
          destinyCardDetailsAsString: JSON.stringify(destinyCard),
          destinyCard , 
          birthData: {
          year: astroData.year,
          month: astroData.month,
          date: astroData.date,
          hours: astroData.hours,
          minutes: astroData.minutes,
          seconds: astroData.seconds,
          latitude: astroData.latitude,
          longitude: astroData.longitude,
          timezone: astroData.timezone,
        } } },
        { upsert: true }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: {
        name: userData?.name,
        email: userData?.email,
        photoURL: userData?.photoURL,
        astroDetails: natalChartData,
        destinyCard: destinyCard,
        birthData: {
          year: astroData.year,
          month: astroData.month,
          date: astroData.date,
          hours: astroData.hours,
          minutes: astroData.minutes,
        }
      }
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
});



