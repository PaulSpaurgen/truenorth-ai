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
      return NextResponse.json({ error: 'No birth data found' }, { status: 400 });
    }

    const natalInput = userData.astroDetails.input;
    const dob = `${natalInput.date}/${natalInput.month}/${natalInput.year}`;

    const prompt = `Using Robert Camp's Destiny Cards system (playing-card astrology), create a concise (<=80 words) reading for someone born ${dob}. Identify their Birth Card and Planetary Ruling Card, summarise core personality themes and offer one actionable insight.`;

    const summary = await generateResponse(prompt);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Destiny summary error:', error);
    return NextResponse.json({ error: 'Failed to generate destiny summary' }, { status: 500 });
  }
}); 