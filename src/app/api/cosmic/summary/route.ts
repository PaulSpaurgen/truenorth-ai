import { NextResponse } from "next/server";
import { withAuth } from "@/lib/services/withAuth";
import { dbConnect } from "@/lib/services/mongodb";
import { generateResponse } from "@/lib/services/openai";
import User from "@/models/User";
import type { DecodedIdToken } from "firebase-admin/auth";
import Message from "@/models/Messages";

// Returns a unified Astro + Human Design summary for today
export const POST = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    await dbConnect();
    const uid = user.uid; // user id
    
    const body = await req.json();
    const fetchWithPreviousChats = body?.fetchWithPreviousChats;

    const userData = await User.findOne({ uid });
    if (!userData?.astroDetails) {
      return NextResponse.json(
        { error: "No birth chart data found" },
        { status: 400 }
      );
    }

    const previousChats = await Message.find({ userId: uid }).sort({ createdAt: -1 });

    const natalData = userData.astroDetails;

    // Build minimal prompt – request a very short summary for snappier UX
    let prompt = `Provide a punchy integrated synthesis (≤100 words) that blends this person's Astrology and Destiny Cards profile with today's planetary influences. Finish with one actionable tip.`;
    
    if (fetchWithPreviousChats) {
      const chatMessages = previousChats
        .flatMap(chat => chat.messages)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n");
      
      prompt = `Provide a punchy integrated synthesis (≤100 words) that blends this person's Astrology and Destiny Cards profile with today's planetary influences. Finish with one actionable tip.
      Previous chats: ${chatMessages}`
    }

    let cumulativeSummary = userData?.profileSummary;


    if (!cumulativeSummary) {
      const cumulativeSummaryAI = await generateResponse(prompt, natalData);
      cumulativeSummary = cumulativeSummaryAI.trim();
      await User.updateOne({ uid }, { $set: { cumulativeSummary } });
    }

 

    return NextResponse.json({ summary: cumulativeSummary });
  } catch (error) {
    console.error("Cosmic summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate cosmic summary" },
      { status: 500 }
    );
  }
});
