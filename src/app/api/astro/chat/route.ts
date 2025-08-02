import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/withAuth';
import { generateResponse } from '@/lib/services/openai';
import { ChatService } from '@/lib/services/chatService';
import type { DecodedIdToken } from 'firebase-admin/auth';
import User from '@/models/User';

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionId?: string;
}

export const POST = withAuth(async (req: Request, _user: DecodedIdToken) => {
  try {
    const { messages, sessionId } = (await req.json()) as ChatRequestBody;
    if (!messages) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const userData = await User.findOne({ uid: _user.uid });

    const historyPrompt = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');
    
    const aiResponse = await generateResponse(historyPrompt, userData, 'astro');

    // Add the AI response to messages
    const updatedMessages = [
      ...messages,
      { role: 'assistant' as const, content: aiResponse }
    ];

    // Save chat session
    const savedSessionId = await ChatService.saveChatSession(
      _user.uid,
      'astro',
      updatedMessages,
      sessionId
    );

    return NextResponse.json({ 
      response: aiResponse,
      sessionId: savedSessionId
    });
  } catch (error) {
    console.error('Astro chat error:', error);
    return NextResponse.json({ error: 'Failed to process astro chat' }, { status: 500 });
  }
});

// GET endpoint to retrieve chat sessions
export const GET = withAuth(async (req: Request, _user: DecodedIdToken) => {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session
      const session = await ChatService.getChatSession(_user.uid, 'astro', sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json({ session });
    } else {
      // Get all astro sessions
      const sessions = await ChatService.getChatSessions(_user.uid, 'astro');
      return NextResponse.json({ sessions });
    }
  } catch (error) {
    console.error('Error fetching astro chat sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 });
  }
});

// DELETE endpoint to delete a chat session
export const DELETE = withAuth(async (req: Request, _user: DecodedIdToken) => {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const deleted = await ChatService.deleteChatSession(_user.uid, 'astro', sessionId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting astro chat session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}); 