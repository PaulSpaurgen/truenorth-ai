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
      return NextResponse.json({ error: 'No birth chart data found' }, { status: 400 });
    }
    
    

    let prompt = `Based on the user's birth chart data, provide a concise (≤80 words) astrology snapshot. Include their specific Sun sign, Moon sign, and Ascendant sign with brief interpretations. Mention one current transit and its practical impact. End with one actionable tip. Use actual zodiac sign names, not placeholders.`;
    if (contextMessage) {
      prompt = `Based on the user's birth chart data, provide a concise (≤80 words) astrology snapshot. Include their specific Sun sign, Moon sign, and Ascendant sign with brief interpretations. Mention one current transit and its practical impact. End with one actionable tip. The user's message is: ${contextMessage} Only use the context if it is relevant to the astrology reading. Use actual zodiac sign names, not placeholders.`;
    }

    const summary = await generateResponse(prompt, userData, 'astro');

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Astro summary error:', error);
    return NextResponse.json({ error: 'Failed to generate astro summary' }, { status: 500 });
  }
}); 