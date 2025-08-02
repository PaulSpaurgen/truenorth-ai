import { type UserData } from "./openai";

export function generateDestinySystemPrompt(userData: UserData): string {
  return `You are a senior expert in destiny card interpretation.

USER'S DESTINY CARD INFORMATION:
${userData.destinyCardDetailsAsString || "Limited destiny card information available"}

`;
}   