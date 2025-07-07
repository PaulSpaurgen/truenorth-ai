import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { dbConnect } from '@/lib/mongodb';
import Summary, { SummaryDoc } from '@/models/Summary';
import { generateResponse } from '@/lib/openai';
import User from '@/models/User';
import type { DecodedIdToken } from 'firebase-admin/auth';

const getToday = (): string => new Date().toISOString().split('T')[0];

export const GET = withAuth(async (_req: Request, user: DecodedIdToken) => {
  try {
    await dbConnect();
    const uid = user.uid;
    const today = getToday();

    // Check cache (MongoDB TTL)
    let summaryDoc: SummaryDoc | null = await Summary.findOne({ uid, date: today, type: 'astro' });

    if (!summaryDoc) {
      // Fetch user natal data
      const userData = await User.findOne({ uid });
      if (!userData?.astroDetails) {
        return NextResponse.json({ error: 'No birth chart data found' }, { status: 400 });
      }

      const natalData = userData.astroDetails;

      // Generate Astro Summary
      const astroSummary = await generateResponse(
        `Create a concise 2-paragraph astrological summary (max 150 words total) for this person born ${natalData.input.date}/${natalData.input.month}/${natalData.input.year}.

Key natal positions: ${JSON.stringify(natalData.output?.[0] ?? {}, null, 2)}

Paragraph 1: Core personality traits based on Sun, Moon, Ascendant.
Paragraph 2: Key life themes and current planetary influences.

Be insightful but concise.`,
        undefined,
        natalData
      );

      summaryDoc = await Summary.create({
        uid,
        date: today,
        type: 'astro',
        summary: astroSummary,
      });
    }

    return NextResponse.json({ success: true, summary: summaryDoc?.summary });
  } catch (error) {
    console.error('Astro summary error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch astro summary' }, { status: 500 });
  }
});

// POST feedback { feedback: string }
export const POST = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    const { feedback } = await req.json();
    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 });
    }
    await dbConnect();
    const uid = user.uid;
    const today = getToday();

    const summaryDoc = await Summary.findOne({ uid, date: today, type: 'astro' });
    if (!summaryDoc) {
      return NextResponse.json({ error: 'Summary not found' }, { status: 404 });
    }

    // Generate refined summary based on user feedback
    const refined = await generateResponse(
      `You are an expert astrologer. Original summary:\n${summaryDoc.summary}\n\nUser feedback/request: ${feedback}\n\nProvide an updated reply (max 150 words) addressing the feedback without repeating the full original text unless necessary.`
    );

    return NextResponse.json({ success: true, response: refined });
  } catch (error) {
    console.error('Astro feedback error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit feedback' }, { status: 500 });
  }
}); 