import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { generateResponse } from '@/lib/openai';

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const POST = withAuth(async (req: Request) => {
  try {
    const { messages } = (await req.json()) as ChatRequestBody;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Flatten chat into a single prompt for simplicity. In production, you may stream.
    const historyPrompt = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const aiResponse = await generateResponse(historyPrompt);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Cosmic chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}); 