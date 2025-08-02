import { OpenAI } from "openai";
import { generateAstroSystemPrompt } from "./astroPromptGenerator";
import { type NatalChartData } from "./astroCalculation";
import { generateDestinySystemPrompt } from "./destinyPromptGenerator";
import { generateCosmicSystemPrompt } from "./cusmicPromptGenerator";
import { type DestinyCard } from "./destinyCards";

export interface UserData {
  astroDetailsAsString: string,
  destinyCardDetailsAsString: string,
  astroSummary: string,
  destinySummary: string,
  profileSummary: string,
  astroDetails: NatalChartData,
  destinyCard: DestinyCard,
  birthData?: {
    year: number;
    month: number;
    date: number;
    hours: number;
    minutes: number;
  };
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateResponse(
  message: string,
  userData: UserData,
  contextType: "astro" | "destiny" | "combined" = "astro"
) {
  let systemPrompt = "";

  switch (contextType) {
    case "astro":
      systemPrompt = generateAstroSystemPrompt(userData);
      break;
    case "destiny":
      systemPrompt = generateDestinySystemPrompt(userData);
      break;
    case "combined":
      systemPrompt = generateCosmicSystemPrompt(userData);
      break;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.6,
      max_tokens: 700,
    });

    const aiResponse =
      response.choices[0]?.message?.content ||
      "I apologize, but I'm having trouble connecting to my cosmic insights right now. Please try again.";

    return aiResponse;
  } catch (error) {
    throw error;
  }
}
