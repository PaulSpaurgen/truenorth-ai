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

    const prompt = `Provide a concise (≤80 words) Human Design reading (HD terms only). Cover Energy Type, Strategy, Authority and end with one actionable insight.`;

    const summary = await generateResponse(prompt, natalData, true);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('HD summary error:', error);
    return NextResponse.json({ error: 'Failed to generate human design summary' }, { status: 500 });
  }
}); 