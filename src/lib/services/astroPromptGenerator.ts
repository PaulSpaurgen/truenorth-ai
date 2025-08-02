import {
  compareNatalWithToday,
  generateTodayAstroSummary,
  type NatalChartData,
} from "./astroCalculation";

interface UserData {
  astroDetailsAsString?: string;
  astroDetails?: NatalChartData;
  destinyCardDetailsAsString?: string;
  birthData?: {
    year: number;
    month: number;
    date: number;
    hours: number;
    minutes: number;
  };
}

export function generateAstroSystemPrompt(userData: UserData): string {
  const todayAstroSummary = generateTodayAstroSummary();

  if (userData.astroDetails) {
    const transitComparison = compareNatalWithToday(
      userData.astroDetails,
      todayAstroSummary
    );

    return `You are a senior astrologer with decades of experience in natal chart interpretation and transit analysis.

USER'S NATAL CHART INFORMATION:
${
  userData.astroDetailsAsString ||
  "Natal chart data available in structured format"
}

TODAY'S ASTROLOGICAL TRANSITS:
Date: ${todayAstroSummary.date}
Current Sun Sign: ${todayAstroSummary.currentInterpretations.sunSign}
Current Moon Sign: ${todayAstroSummary.currentInterpretations.moonSign}

TRANSIT COMPARISON ANALYSIS:
${transitComparison.summary}

Key Planetary Transits Today:
${Object.entries(todayAstroSummary.currentPlanets)
  .map(
    ([, data]) =>
      `${data.name}: ${data.position.degrees}°${data.position.minutes}'${
        data.position.seconds
      }" ${data.signName}${data.retrograde ? " (Retrograde)" : ""}`
  )
  .join("\n")}

Current Aspects to Natal Chart:
${
  Object.entries(transitComparison.aspects)
    .map(([planet, aspectList]) =>
      aspectList
        .map(
          (aspect) =>
            `${planet} ${aspect.aspect} (${aspect.influence}, orb: ${aspect.orb}°)`
        )
        .join("\n")
    )
    .join("\n") || "No major aspects within orb today"
}

Based on this comprehensive astrological analysis, provide personalized insights that combine the user's natal chart characteristics with today's planetary influences. Focus on practical guidance and meaningful interpretations.`;
  } else {
    return `You are a senior astrologer with decades of experience. 

USER'S NATAL INFORMATION:
${
  userData.astroDetailsAsString || "Limited natal chart information available"
}

TODAY'S GENERAL ASTROLOGICAL CLIMATE:
Date: ${todayAstroSummary.date}
Current Sun Sign: ${todayAstroSummary.currentInterpretations.sunSign}
Current Moon Sign: ${todayAstroSummary.currentInterpretations.moonSign}

Provide general astrological guidance based on today's planetary positions and any available user information.`;
  }
} 