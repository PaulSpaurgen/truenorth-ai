import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { dbConnect } from '@/lib/mongodb';
import { generateResponse } from '@/lib/openai';
import User from '@/models/User';
import type { DecodedIdToken } from 'firebase-admin/auth';

export const POST = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    await dbConnect();
    const uid = user.uid;
    const userData = await User.findOne({ uid });
    const { contextMessage } = await req.json();
    if (!userData?.astroDetails) {
      return NextResponse.json({ error: 'No birth data found' }, { status: 400 });
    }

    let prompt = `Using Robert Camp's Destiny Cards system (playing-card astrology), create a concise (<=80 words) reading. Identify their Birth Card and Planetary Ruling Card, summarise core personality themes and offer one actionable insight.`;
    if (contextMessage) {
      prompt = `Using Robert Camp's Destiny Cards system (playing-card astrology), create a concise (<=80 words) reading. Identify their Birth Card and Planetary Ruling Card, summarise core personality themes and offer one actionable insight. The user's message is: ${contextMessage} Only use the context if it is relevant to the destiny reading.`;
    }

    const summary = await generateResponse(prompt, userData, 'destiny');
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Destiny summary error:', error);
    return NextResponse.json({ error: 'Failed to generate destiny summary' }, { status: 500 });
  }
}); 