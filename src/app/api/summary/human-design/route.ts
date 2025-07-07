import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { dbConnect } from "@/lib/mongodb";
import Summary, { SummaryDoc } from "@/models/Summary";
import { generateResponse } from "@/lib/openai";
import User from "@/models/User";
import type { DecodedIdToken } from "firebase-admin/auth";
import { signDegreeToGate } from "@/lib/humandesign";

const getToday = (): string => new Date().toISOString().split("T")[0];

export const GET = withAuth(async (_req: Request, user: DecodedIdToken) => {
  try {
    await dbConnect();
    const uid = user.uid;
    const today = getToday();

    let summaryDoc: SummaryDoc | null = await Summary.findOne({
      uid,
      date: today,
      type: "human-design",
    });
    const userData = await User.findOne({ uid });
    if (!userData?.astroDetails) {
      return NextResponse.json(
        { error: "No birth chart data found" },
        { status: 400 }
      );
    }

    const astroData = userData.astroDetails;

    // Build Human Design gate information from planetary positions
    let gateInfo = "";
    if (astroData.output && astroData.output[0]) {
      const planetsData = astroData.output[0];
      const zodiacSigns = [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
      ];

      gateInfo = "\n\nHuman Design Gates from Birth Chart:";
      Object.keys(planetsData).forEach((key) => {
        const planetData = planetsData[key];
        if (
          planetData.name &&
          key !== "debug" &&
          key !== "13" &&
          planetData.current_sign !== undefined &&
          planetData.normDegree !== undefined
        ) {
          try {
            const gate = signDegreeToGate(
              planetData.current_sign,
              planetData.normDegree
            );
            const signName =
              zodiacSigns[planetData.current_sign - 1] || "Unknown";
            gateInfo += `\n- ${
              planetData.name
            }: Gate ${gate} (${planetData.normDegree.toFixed(1)}° ${signName})${
              planetData.isRetro === "true" ? " Retrograde" : ""
            }`;
          } catch {
            // Skip if gate calculation fails
          }
        }
      });
    }

    const hdSummary = await generateResponse(
      `You are a certified Human-Design analyst with deep knowledge of the 64 gates, 9 centers, channels, and the body graph system. 

CRITICAL: Use ONLY Human-Design terminology. You are FORBIDDEN from mentioning:
❌ NEVER SAY: Gemini, Cancer, Virgo, Leo, Aries, Taurus, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces
❌ NEVER SAY: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
❌ NEVER SAY: Ascendant, Midheaven, houses (1st house, 2nd house, etc.)
❌ NEVER SAY: "Mercury retrograde," "Moon in Virgo," "Cancer rising"
❌ NEVER SAY: Any astrological aspects, transits, or zodiacal references

✅ INSTEAD USE: Gates (1-64), Centers (Sacral, Heart, Throat, etc.), Channels, Type (Generator/Projector/Manifestor/Reflector), Strategy, Authority, Profile lines, Definition, Incarnation Cross

Birth Information:
- Date: ${astroData.input?.date}/${astroData.input?.month}/${
        astroData.input?.year
      }
- Time: ${astroData.input?.hours}:${astroData.input?.minutes
        ?.toString()
        .padStart(2, "0")}
- Location: ${astroData.input?.latitude}°, ${
        astroData.input?.longitude
      }°${gateInfo}

Based ONLY on these activated gates, provide a Human Design reading in exactly TWO paragraphs (≤150 words total):

**Paragraph 1**: Analyze the gate activations to determine their Energy Type (Generator, Projector, Manifestor, or Reflector), Strategy, and Inner Authority. Include one practical daily tip for using their Strategy and Authority.

**Paragraph 2**: Based on gate patterns, describe their Profile lines, Definition configuration, and suggest their Incarnation Cross theme. Provide one actionable insight for living their design.

EXAMPLE of correct language: "As a Generator with Sacral Authority, your strategy is to respond to life's invitations. Your defined Sacral Center gives you sustainable life force energy. With Gate 34 activated, you have the power of the great..."

Write in plain text, no bullet points. Stay strictly within Human Design vocabulary.`,
      astroData,
      true
    );

    if (!summaryDoc) {
      summaryDoc = await Summary.create({
        uid,
        date: today,
        type: "human-design",
        summary: hdSummary,
      });
    } else {
      summaryDoc.summary = hdSummary;
      await summaryDoc.save();
    }

    return NextResponse.json({ success: true, summary: hdSummary });
  } catch (error) {
    console.error("HD summary error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch human design summary" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: Request, user: DecodedIdToken) => {
  try {
    const { feedback } = await req.json();
    if (!feedback || typeof feedback !== "string") {
      return NextResponse.json(
        { error: "Feedback is required" },
        { status: 400 }
      );
    }
    await dbConnect();
    const uid = user.uid;
    const today = getToday();

    const summaryDoc = await Summary.findOne({
      uid,
      date: today,
      type: "human-design",
    });
    if (!summaryDoc)
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });

    const refined = await generateResponse(
      `You are a Human-Design guide. STRICTLY avoid astrology terms (planets, signs, houses). 

Original Human Design reading:
${summaryDoc.summary}

User feedback/request: ${feedback}

Provide an improved Human Design response (≤150 words) using only authentic Human Design terminology: gates, centers, channels, authority, strategy, definition, profile, incarnation cross, etc.`
    );

    return NextResponse.json({ success: true, response: refined });
  } catch (error) {
    console.error("HD feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
});
