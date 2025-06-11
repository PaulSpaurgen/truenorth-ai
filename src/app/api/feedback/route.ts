import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { chatId, type, comment } = await req.json();

    const feedback = await prisma.feedback.create({
      data: {
        chatId,
        type,
        comment,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error in feedback route:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
} 