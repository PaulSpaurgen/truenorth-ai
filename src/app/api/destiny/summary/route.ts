import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/withAuth';
import { dbConnect } from '@/lib/services/mongodb';
import { generateResponse } from '@/lib/services/openai';
import User from '@/models/User';
import type { DecodedIdToken } from 'firebase-admin/auth';
import Message from '@/models/Messages';

export const POST = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    await dbConnect();
    const uid = user.uid; // user id

    const body = await req.json();
    const fetchWithPreviousChats = body?.fetchWithPreviousChats;

    const userData = await User.findOne({ uid });
    if (!userData?.astroDetails) {
      return NextResponse.json({ error: 'No birth data found' }, { status: 400 });
    }

    const previousChats = await Message.find({ userId: uid }).sort({ createdAt: -1 });

    let prompt = `Using Robert Camp's Destiny Cards system (playing-card astrology), create a concise (<=80 words) reading. Identify their Birth Card and Planetary Ruling Card, summarise core personality themes and offer one actionable insight.`;
    
    if (fetchWithPreviousChats) {
      const chatMessages = previousChats
        .flatMap(chat => chat.messages)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n");
      
      prompt = `Using Robert Camp's Destiny Cards system (playing-card astrology), create a concise (<=80 words) reading. Identify their Birth Card and Planetary Ruling Card, summarise core personality themes and offer one actionable insight.
      Previous chats: ${chatMessages}`
    }

    let destinySummary = userData?.destinySummary;

    if (!destinySummary || fetchWithPreviousChats) {
      const destinySummaryAI = await generateResponse(prompt, userData, 'destiny');
      destinySummary = destinySummaryAI.trim();
      await User.updateOne({ uid }, { $set: { destinySummary } });
    }

 

    return NextResponse.json({ summary: destinySummary });
  } catch (error) {
    console.error('Destiny summary error:', error);
    return NextResponse.json({ error: 'Failed to generate destiny summary' }, { status: 500 });
  }
}); 