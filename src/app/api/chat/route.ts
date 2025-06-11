import { NextResponse } from 'next/server';
import { generateResponse } from '@/lib/openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Generate response using OpenAI
    const response = await generateResponse(message, "Your context here"); // We'll add proper context later

    // Store in database
    const chat = await prisma.chat.create({
      data: {
        message,
        response,
      },
    });

    return NextResponse.json({ 
      id: chat.id,
      response: chat.response 
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 