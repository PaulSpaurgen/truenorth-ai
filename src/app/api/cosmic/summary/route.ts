import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { dbConnect } from '@/lib/mongodb';
import { generateResponse } from '@/lib/openai';
import User from '@/models/User';
import type { DecodedIdToken } from 'firebase-admin/auth';

// Returns a unified Astro + Human Design summary for today
export const GET = withAuth(async (_req: Request, user: DecodedIdToken) => {
  try {
    await dbConnect();
    const uid = user.uid;

    const userData = await User.findOne({ uid });
    if (!userData?.astroDetails) {
      return NextResponse.json({ error: 'No birth chart data found' }, { status: 400 });
    }

    const natalData = userData.astroDetails;

    // Build minimal prompt – request a very short summary for snappier UX
    const prompt = `Provide a punchy integrated synthesis (≤100 words) that blends this person's Astrology and Human Design profile with today's planetary influences. Finish with one actionable tip.`;

    const summary = await generateResponse(prompt, natalData);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Cosmic summary error:', error);
    return NextResponse.json({ error: 'Failed to generate cosmic summary' }, { status: 500 });
  }
}); 