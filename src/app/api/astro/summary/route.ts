import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { dbConnect } from '@/lib/mongodb';
import { generateResponse } from '@/lib/openai';
import User from '@/models/User';
import type { DecodedIdToken } from 'firebase-admin/auth';

export const GET = withAuth(async (_req: Request, user: DecodedIdToken) => {
  try {
    await dbConnect();

    const uid = user.uid;
    const userData = await User.findOne({ uid });
    if (!userData?.astroDetails) {
      return NextResponse.json({ error: 'No birth chart data found' }, { status: 400 });
    }

    const natalData = userData.astroDetails;

    const prompt = `Provide a concise (≤80 words) astrology snapshot highlighting Sun, Moon, Ascendant and today's key transit. End with one practical tip.`;

    const summary = await generateResponse(prompt, natalData);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Astro summary error:', error);
    return NextResponse.json({ error: 'Failed to generate astro summary' }, { status: 500 });
  }
}); 