import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebaseAdmin';
import { dbConnect } from '@/lib/mongodb';
import Message from '@/models/Message';

/**
 * Stores feedback in the corresponding Message document.
 */
export async function POST(req: Request) {
  try {
    // Check auth
    const authHeader = req.headers.get('authorization') || '';
    const match = authHeader.match(/^Bearer (.*)$/i);
    if (!match) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyAuthToken(match[1]);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const { chatId, type, comment } = await req.json();

    await dbConnect();

    await Message.findByIdAndUpdate(chatId, {
      $push: {
        feedback: {
          userId: decoded.uid,
          type,
          comment,
          createdAt: new Date(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in feedback route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
} 