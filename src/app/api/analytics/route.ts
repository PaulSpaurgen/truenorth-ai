import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/withAuth';
import { dbConnect } from '@/lib/services/mongodb';
import Message from '@/models/Messages';

interface FeedbackItem {
  type: 'like' | 'dislike' | 'correction';
  comment?: string;
  createdAt: Date;
}

export const GET = withAuth(async () => {
  try {
    await dbConnect();

    // Get all messages with feedback
    const messages = await Message.find({
      'feedback.0': { $exists: true } // Only messages that have feedback
    }).select('feedback userMessage aiResponse createdAt');

    // Calculate analytics
    const totalFeedback = messages.reduce((acc, msg) => acc + msg.feedback.length, 0);
    const feedbackTypes = { like: 0, dislike: 0, correction: 0 };
    const feedbackOverTime: Record<string, { like: number; dislike: number; correction: number }> = {};

    messages.forEach(msg => {
      msg.feedback.forEach((fb: FeedbackItem) => {
        feedbackTypes[fb.type]++;
        
        // Group by date for time series
        const date = new Date(fb.createdAt).toISOString().split('T')[0];
        if (!feedbackOverTime[date]) {
          feedbackOverTime[date] = { like: 0, dislike: 0, correction: 0 };
        }
        feedbackOverTime[date][fb.type]++;
      });
    });

    // Calculate satisfaction rate
    const satisfactionRate = totalFeedback > 0 
      ? ((feedbackTypes.like / totalFeedback) * 100).toFixed(1)
      : 0;

    // Recent feedback with context
    const recentFeedback = messages
      .filter(msg => msg.feedback.length > 0)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
      .map(msg => ({
        id: msg._id,
        userMessage: msg.userMessage,
        aiResponse: msg.aiResponse,
        feedback: msg.feedback.map((fb: FeedbackItem) => ({
          type: fb.type,
          comment: fb.comment,
          createdAt: fb.createdAt
        })),
        createdAt: msg.createdAt
      }));

    return NextResponse.json({
      summary: {
        totalMessages: await Message.countDocuments(),
        totalFeedback,
        satisfactionRate: `${satisfactionRate}%`,
        feedbackTypes
      },
      feedbackOverTime: Object.entries(feedbackOverTime).map(([date, data]) => ({
        date,
        ...data
      })),
      recentFeedback
    });

  } catch (error) {
    console.error('Error in analytics route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}); 