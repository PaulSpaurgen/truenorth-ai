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

    let summaryDoc: SummaryDoc | null = await Summary.findOne({ uid, date: today, type: 'human-design' });

    if (!summaryDoc) {
      const userData = await User.findOne({ uid });
      if (!userData?.astroDetails) {
        return NextResponse.json({ error: 'No birth chart data found' }, { status: 400 });
      }
      const natalData = userData.astroDetails;

      const hdSummary = await generateResponse(
        `Create a concise 2-paragraph Human Design summary (max 150 words total) for this person born ${natalData.input.date}/${natalData.input.month}/${natalData.input.year}.

Key natal positions: ${JSON.stringify(natalData.output?.[0] ?? {}, null, 2)}

Paragraph 1: Energy type, strategy, and best decision-making approach.
Paragraph 2: Life purpose themes and how to align with natural flow.

Be insightful but concise.`,
        undefined,
        natalData
      );

      summaryDoc = await Summary.create({ uid, date: today, type: 'human-design', summary: hdSummary });
    }

    return NextResponse.json({ success: true, summary: summaryDoc?.summary });
  } catch (error) {
    console.error('HD summary error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch human design summary' }, { status: 500 });
  }
});

export const POST = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    const { feedback } = await req.json();
    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 });
    }
    await dbConnect();
    const uid = user.uid;
    const today = getToday();

    const summaryDoc = await Summary.findOne({ uid, date: today, type: 'human-design' });
    if (!summaryDoc) return NextResponse.json({ error: 'Summary not found' }, { status: 404 });

    const refined = await generateResponse(
      `You are a Human Design guide. Original summary:\n${summaryDoc.summary}\n\nUser feedback/request: ${feedback}\n\nProvide an updated reply (max 150 words) addressing the feedback in friendly tone.`
    );

    return NextResponse.json({ success: true, response: refined });
  } catch (error) {
    console.error('HD feedback error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit feedback' }, { status: 500 });
  }
}); 