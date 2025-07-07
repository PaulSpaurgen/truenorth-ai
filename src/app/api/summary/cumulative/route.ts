import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { dbConnect } from '@/lib/mongodb';
import Summary, { SummaryDoc } from '@/models/Summary';
import { generateResponse } from '@/lib/openai';
import User from '@/models/User';
import type { DecodedIdToken } from 'firebase-admin/auth';

const getToday = (): string => new Date().toISOString().split('T')[0];

async function getOrCreateSummary(uid: string, type: 'astro' | 'human-design', natalData: Record<string, unknown>): Promise<string> {
  const today = getToday();
  const doc = await Summary.findOne({ uid, date: today, type });
  if (doc) return doc.summary;

  const input = natalData.input as { date: number; month: number; year: number };
  const output = natalData.output as Array<Record<string, unknown>>;
  
  const prompt = type === 'astro'
    ? `Create a concise 2-paragraph astrological summary (max 150 words total) for this person born ${input.date}/${input.month}/${input.year}.

Key natal positions: ${JSON.stringify(output?.[0] ?? {}, null, 2)}

Paragraph 1: Core personality traits based on Sun, Moon, Ascendant.
Paragraph 2: Key life themes and current planetary influences.

Be insightful but concise.`
    : `Create a concise 2-paragraph Human Design summary (max 150 words total) for this person born ${input.date}/${input.month}/${input.year}.

Key natal positions: ${JSON.stringify(output?.[0] ?? {}, null, 2)}

Paragraph 1: Energy type, strategy, and decision-making approach.
Paragraph 2: Life purpose themes and how to align with natural flow.

Be insightful but concise.`;

  const summary = await generateResponse(prompt);
  await Summary.create({ uid, date: today, type, summary });
  return summary;
}

export const GET = withAuth(async (_req: Request, user: DecodedIdToken) => {
  try {
    await dbConnect();
    const uid = user.uid;
    const today = getToday();

    let cumulativeDoc: SummaryDoc | null = await Summary.findOne({ uid, date: today, type: 'cumulative' });

    if (!cumulativeDoc) {
      const userData = await User.findOne({ uid });
      if (!userData?.astroDetails) {
        return NextResponse.json({ error: 'No birth chart data found' }, { status: 400 });
      }
      const natalData = userData.astroDetails;

      // Ensure other summaries
      const astroSummary = await getOrCreateSummary(uid, 'astro', natalData);
      const hdSummary = await getOrCreateSummary(uid, 'human-design', natalData);

      const cumulativeSummary = await generateResponse(
        `Create a comprehensive synthesis combining Astrology and Human Design for this person born ${natalData.input.date}/${natalData.input.month}/${natalData.input.year}.

Astrology Summary: ${astroSummary}
Human Design Summary: ${hdSummary}

Create a unified 3-4 paragraph synthesis that integrates both systems and offers practical life guidance.

Be comprehensive yet accessible.`,
        undefined,
        natalData
      );

      cumulativeDoc = await Summary.create({ uid, date: today, type: 'cumulative', summary: cumulativeSummary });
    }

    return NextResponse.json({ success: true, summary: cumulativeDoc?.summary });
  } catch (error) {
    console.error('Cumulative summary error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch cumulative summary' }, { status: 500 });
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

    const summaryDoc = await Summary.findOneAndUpdate(
      { uid, date: today, type: 'cumulative' },
      { $push: { feedback } },
      { new: true }
    );

    if (!summaryDoc) return NextResponse.json({ error: 'Summary not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cumulative feedback error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit feedback' }, { status: 500 });
  }
}); 