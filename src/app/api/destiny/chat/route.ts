import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { generateResponse } from '@/lib/openai';
import type { DecodedIdToken } from 'firebase-admin/auth';

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withAuth(async (req: Request, _user: DecodedIdToken) => {
  try {
    const { messages } = (await req.json()) as ChatRequestBody;
    if (!messages) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const historyPrompt = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const aiResponse = await generateResponse(historyPrompt);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Destiny chat error:', error);
    return NextResponse.json({ error: 'Failed to process destiny chat' }, { status: 500 });
  }
}); 