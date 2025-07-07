import { NextResponse } from "next/server";
import { generateResponse } from "@/lib/openai";
import { dbConnect } from "@/lib/mongodb";
import { withAuth } from "@/lib/withAuth";
import User from "@/models/User";
import Message from "@/models/Message";
import type { DecodedIdToken } from "firebase-admin/auth";

// const prisma = new PrismaClient();

export const POST = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    const uid = user.uid;

    const { message, conversationHistory } = await req.json();

    // Ensure DB connection and user document
    await dbConnect();

    const userData = await User.findOne({ uid });
    const astroData = userData?.astroDetails;

    // Generate AI response
    const responseText = await generateResponse(
      conversationHistory
        ? `${message}\n\nPrevious conversation: ${JSON.stringify(
            conversationHistory.slice(-3)
          )}`
        : message,
      astroData,
      false // isHumanDesign = false for regular chat
    );

    // Persist message pair
    const saved = await Message.create({
      userId: uid,
      userMessage: message,
      aiResponse: responseText,
    });

    return NextResponse.json({
      id: saved._id.toString(),
      response: responseText,
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
});
