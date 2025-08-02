import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/withAuth';
import { dbConnect } from '@/lib/services/mongodb';
import Message from '@/models/Messages';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Stores feedback in the corresponding Message document.
 */
export const POST = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    const uid = user.uid;

    const { chatId, type, comment } = await req.json();

    if (!chatId) {
      return NextResponse.json({ success: false, error: 'No chat session ID provided' }, { status: 400 });
    }

    await dbConnect();

    // Find the most recent chat session for this user and chat type
    const chatSession = await Message.findOne({ 
      userId: uid,
      sessionId: chatId 
    }).sort({ createdAt: -1 });

    if (!chatSession) {
      return NextResponse.json({ success: false, error: 'Chat session not found' }, { status: 404 });
    }

    await Message.findByIdAndUpdate(chatSession._id, {
      $push: {
        feedback: {
          userId: uid,
          type,
          comment,
          createdAt: new Date(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in feedback route:', error);
    return NextResponse.json({ success: false, error: 'Failed to process feedback' }, { status: 500 });
  }
}); 