import { NextResponse } from "next/server";
import { withAuth } from "@/lib/services/withAuth";
import { dbConnect } from "@/lib/services/mongodb";
import { generateResponse } from "@/lib/services/openai";
import User from "@/models/User";
import type { DecodedIdToken } from "firebase-admin/auth";
import Message from "@/models/Messages";

export const POST = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    await dbConnect();

    const body = await req.json();
    const fetchWithPreviousChats = body?.fetchWithPreviousChats;

    const uid = user.uid;
    const userData = await User.findOne({ uid });
    if (!userData?.astroDetails) {
      return NextResponse.json(
        { error: "No birth chart data found" },
        { status: 400 }
      );
    }

    const previousChats = await Message.find({ userId: uid }).sort({ createdAt: -1 });

     let astroSummary = userData?.astroSummary ;
     let prompt = `Based on the user's birth chart data, provide a concise (≤80 words) astrology snapshot. Include their specific Sun sign, Moon sign, and Ascendant sign with brief interpretations. Mention one current transit and its practical impact. End with one actionable tip. Use actual zodiac sign names, not placeholders.`
     
     if (fetchWithPreviousChats) {
      const chatMessages = previousChats
        .flatMap(chat => chat.messages)
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n");
      
      prompt = `Based on the user's birth chart data and the following previous chats, provide a concise (≤80 words) astrology snapshot. Include their specific Sun sign, Moon sign, and Ascendant sign with brief interpretations. Mention one current transit and its practical impact. End with one actionable tip. Use actual zodiac sign names, not placeholders.
      Previous chats: ${chatMessages}`
     }
     
    if (!astroSummary || fetchWithPreviousChats) {
      console.log({prompt});
      const astroSummaryAI = await generateResponse(prompt, userData, "astro");
      astroSummary = astroSummaryAI.trim();
      await User.updateOne({ uid }, { $set: { astroSummary } });
    }

   
    return NextResponse.json({ summary: astroSummary });
  } catch (error) {
    console.error("Astro summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate astro summary" },
      { status: 500 }
    );
  }
});
