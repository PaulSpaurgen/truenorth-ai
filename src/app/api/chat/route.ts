import { NextResponse } from 'next/server';
import { generateResponse } from '@/lib/openai';

// const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { message, astroData, conversationHistory } = await req.json();

    // Generate response using OpenAI with astrology context
    const response = await generateResponse(
      message, 
      conversationHistory ? `Previous conversation: ${JSON.stringify(conversationHistory.slice(-3))}` : undefined, // Keep last 3 messages for context
      astroData
    );

    // Store in database
    // const chat = await prisma.chat.create({
    //   data: {
    //     message,
    //     response,
    //   },
    // });

    return NextResponse.json({ 
        id: Math.random().toString(36).substring(2, 15),
        response: response 
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 