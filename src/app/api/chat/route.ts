import { NextResponse } from 'next/server';
import { generateResponse } from '@/lib/openai';
import { verifyAuthToken } from '@/lib/firebaseAdmin';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Message from '@/models/Message';

// const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Verify Firebase ID token
    const authHeader = req.headers.get('authorization') || '';
    const tokenMatch = authHeader.match(/^Bearer (.*)$/i);
    if (!tokenMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAuthToken(tokenMatch[1]);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { message, astroData, conversationHistory } = await req.json();

    // 2. Ensure DB connection and user document
    await dbConnect();

    let userDoc = await User.findOne({ uid: decoded.uid });
    if (!userDoc) {
      userDoc = await User.create({
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        photoURL: decoded.picture,
      });
    }

    // 3. Generate AI response
    const responseText = await generateResponse(
      message,
      conversationHistory
        ? `Previous conversation: ${JSON.stringify(conversationHistory.slice(-3))}`
        : undefined,
      astroData
    );

    // 4. Persist message pair
    const saved = await Message.create({
      userId: decoded.uid,
      userMessage: message,
      aiResponse: responseText,
    });

    return NextResponse.json({ id: saved._id.toString(), response: responseText });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 