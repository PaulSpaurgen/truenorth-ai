import { NextResponse } from 'next/server';

/**
 * Simple in-memory feedback handler (no database).
 * Vercel functions are ephemeral, so this only logs the feedback and echoes it
 * back to the client. Replace with a real persistence layer if needed later.
 */
export async function POST(req: Request) {
  try {
    const { chatId, type, comment } = await req.json();

    const feedback = {
      id: Math.random().toString(36).substring(2, 9),
      chatId,
      type,
      comment,
      createdAt: new Date().toISOString(),
    };

    console.log('Feedback received:', feedback);

    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    console.error('Error in feedback route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
} 