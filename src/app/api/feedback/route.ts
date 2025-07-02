import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { dbConnect } from '@/lib/mongodb';
import Message from '@/models/Message';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Stores feedback in the corresponding Message document.
 */
export const POST = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    const uid = user.uid;

    const { chatId, type, comment } = await req.json();

    await dbConnect();

    await Message.findByIdAndUpdate(chatId, {
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