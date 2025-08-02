/* eslint-disable @typescript-eslint/no-explicit-any */
// Swiss Ephemeris bindings – we access it via dynamic typing because the
// current @types shipped with "sweph" expose only a subset of the actual API.
// Casting to `any` lets us call the full API without TypeScript errors.
import {
  natalChart,
  planets
} from "./astrologer";
import { calculateAllPlanetsHybrid } from './astrologer/hybrid-calculator';

/**
 * Input expected from the birth-data form.
 */
export interface AstroData {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  seconds: number;
  latitude: number;  // in decimal degrees (+N)
  longitude: number; // in decimal degrees (+E)
  timezone: number;  // offset from UTC in hours
  settings: {
    observation_point: 'topocentric' | 'geocentric';
    ayanamsha: 'lahiri' | 'raman' | 'krishnamurti' | 'sayan';
  };
}

/** Result for a single body */
export interface PlanetPosition {
  lon: number;   // ecliptic longitude in °
  lat: number;   // ecliptic latitude in °
  speed: number; // longitudinal speed °/day
}

export type NatalChart = Record<string, PlanetPosition>;

/**
 * Zodiac sign names and their elements/qualities
 */
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

const SIGN_ELEMENTS = {
  1: 'fire', 2: 'earth', 3: 'air', 4: 'water',
  5: 'fire', 6: 'earth', 7: 'air', 8: 'water',
  9: 'fire', 10: 'earth', 11: 'air', 12: 'water'
} as const;

const SIGN_QUALITIES = {
  1: 'cardinal', 2: 'fixed', 3: 'mutable',
  4: 'cardinal', 5: 'fixed', 6: 'mutable',
  7: 'cardinal', 8: 'fixed', 9: 'mutable',
  10: 'cardinal', 11: 'fixed', 12: 'mutable'
} as const;

/**
 * Pure-JS Swiss-Ephemeris calculation – no external HTTP call.
 *
 * Requirements:
 *   1. `npm i sweph`  (already in package.json)
 *   2. The ephemeris files that ship with the module are used automatically;
 *      precision is good enough for a natal chart without extra setup.
 *
 * The function returns a comprehensive natal chart with planets, houses, aspects,
 * and astrological interpretations.
 */
export function calculateAstro(astroData: AstroData): any {
  // Convert the local birth time to an exact UTC Date object.
  // The timezone is *offset from UTC*. For CST (UTC-6) the offset is -6.
  // Local time = UTC + offset  ⇒  UTC = local time - offset.
  const utcHours = astroData.hours - astroData.timezone;

  const birthDate = new Date(Date.UTC(
    astroData.year,
    astroData.month - 1, // JavaScript months are 0-indexed
    astroData.date,
    utcHours,
    astroData.minutes,
    astroData.seconds
  ));

  // Calculate comprehensive natal chart using hybrid approach (Swiss Ephemeris + NASA JPL fallback)
  const hybridPlanets = calculateAllPlanetsHybrid(birthDate);
  
  // Use the hybrid planets in the chart calculation
  const chart = natalChart(
    birthDate,
    astroData.latitude,
    astroData.longitude,
    'P' // Placidus house system
  );
  
  // Override planets with hybrid calculations
  (chart as any).planets = hybridPlanets;

  console.log(hybridPlanets, 'hybridPlanets');

  // Analyze chart patterns
  const chartPatterns = analyzeChartPatterns(chart, hybridPlanets);

  // Generate interpretations
  const interpretations = generateInterpretations(chart, hybridPlanets);

  return {
    birthInfo: {
      date: birthDate.toISOString(),
      latitude: astroData.latitude,
      longitude: astroData.longitude,
      timezone: astroData.timezone
    },
    planets: hybridPlanets, // Use hybrid planets instead of chart.astros
    houses: chart.houses,
    axes: chart.axes,
    aspects: chart.aspects,
    chartPatterns,
    interpretations
  };
}

/**
 * Analyze chart patterns like stelliums and element/quality emphasis
 */
function analyzeChartPatterns(chart: any, hybridPlanets: any) {
  const planetSigns = Object.values(hybridPlanets).map((planet: any) => planet.sign);
  
  // Find stelliums (3+ planets in same sign)
  const signCounts: Record<number, number> = {};
  planetSigns.forEach((sign: number) => {
    signCounts[sign] = (signCounts[sign] || 0) + 1;
  });
  
  const stelliums = Object.entries(signCounts)
    .filter(([, count]) => count >= 3)
    .map(([sign]) => ZODIAC_SIGNS[parseInt(sign) - 1]);

  // Calculate element emphasis
  const elementCounts: Record<string, number> = {};
  planetSigns.forEach((sign: number) => {
    const element = SIGN_ELEMENTS[sign as keyof typeof SIGN_ELEMENTS];
    elementCounts[element] = (elementCounts[element] || 0) + 1;
  });

  // Calculate quality emphasis
  const qualityCounts: Record<string, number> = {};
  planetSigns.forEach((sign: number) => {
    const quality = SIGN_QUALITIES[sign as keyof typeof SIGN_QUALITIES];
    qualityCounts[quality] = (qualityCounts[quality] || 0) + 1;
  });

  return {
    stelliums,
    elementEmphasis: elementCounts,
    qualityEmphasis: qualityCounts
  };
}

/**
 * Generate astrological interpretations
 */
function generateInterpretations(chart: any, hybridPlanets: any) {
  const sunSign = ZODIAC_SIGNS[hybridPlanets.sun.sign - 1];
  const moonSign = ZODIAC_SIGNS[hybridPlanets.moon.sign - 1];
  const risingSign = chart.axes.asc ? ZODIAC_SIGNS[chart.axes.asc.sign - 1] : 'Unknown';

  // Find dominant elements and qualities
  const planetSigns = Object.values(hybridPlanets).map((planet: any) => planet.sign);
  const elementCounts: Record<string, number> = {};
  const qualityCounts: Record<string, number> = {};

  planetSigns.forEach((sign: number) => {
    const element = SIGN_ELEMENTS[sign as keyof typeof SIGN_ELEMENTS];
    const quality = SIGN_QUALITIES[sign as keyof typeof SIGN_QUALITIES];
    elementCounts[element] = (elementCounts[element] || 0) + 1;
    qualityCounts[quality] = (qualityCounts[quality] || 0) + 1;
  });

  const dominantElements = Object.entries(elementCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([element]) => element);

  const dominantQualities = Object.entries(qualityCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([quality]) => quality);

  return {
    sunSign,
    moonSign,
    risingSign,
    dominantElements,
    dominantQualities
  };
}

/**
 * Calculate current transits for a given date
 */
export function calculateCurrentTransits(transitDate: Date = new Date()): any {
  return planets(transitDate);
}

/**
 * Generate a comprehensive natal chart report
 */
// Interface for the structured natal chart data
export interface NatalChartData {
  birthInfo: {
    date: string;
    latitude: number;
    longitude: number;
    timezone: number;
  };
  planets: Record<string, {
    name: string;
    position: {
      degrees: number;
      minutes: number;
      seconds: number;
      longitude: number;
    };
    sign: number;
    signName: string;
    retrograde: boolean;
    speed: number;
  }>;
  chartPatterns: {
    stelliums: string[];
    elementEmphasis: Record<string, number>;
    qualityEmphasis: Record<string, number>;
  };
  interpretations: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    dominantElements: string[];
    dominantQualities: string[];
  };
  calculatedAt: string;
}

export function generateNatalChartData(astroData: AstroData): NatalChartData {
  const chart = calculateAstro(astroData);
  
  // Transform planets data into structured format
  const planetsData: Record<string, any> = {};
  Object.entries(chart.planets).forEach(([planet, data]: [string, any]) => {
    const signName = ZODIAC_SIGNS[data.sign - 1];
    planetsData[planet] = {
      name: planet.charAt(0).toUpperCase() + planet.slice(1),
      position: {
        degrees: data.position.degrees,
        minutes: data.position.minutes,
        seconds: data.position.seconds,
        longitude: data.position.longitude
      },
      sign: data.sign,
      signName: signName,
      retrograde: data.retrograde,
      speed: data.speed
    };
  });

  return {
    birthInfo: {
      date: chart.birthInfo.date,
      latitude: chart.birthInfo.latitude,
      longitude: chart.birthInfo.longitude,
      timezone: chart.birthInfo.timezone
    },
    planets: planetsData,
    chartPatterns: {
      stelliums: chart.chartPatterns.stelliums,
      elementEmphasis: chart.chartPatterns.elementEmphasis,
      qualityEmphasis: chart.chartPatterns.qualityEmphasis
    },
    interpretations: {
      sunSign: chart.interpretations.sunSign,
      moonSign: chart.interpretations.moonSign,
      risingSign: chart.interpretations.risingSign,
      dominantElements: chart.interpretations.dominantElements,
      dominantQualities: chart.interpretations.dominantQualities
    },
    calculatedAt: new Date().toISOString()
  };
}

// Interface for today's astrological summary
export interface TodayAstroSummary {
  date: string;
  currentPlanets: Record<string, {
    name: string;
    position: {
      degrees: number;
      minutes: number;
      seconds: number;
      longitude: number;
    };
    sign: number;
    signName: string;
    retrograde: boolean;
    speed: number;
  }>;
  currentInterpretations: {
    sunSign: string;
    moonSign: string;
    dominantElements: string[];
    dominantQualities: string[];
  };
  calculatedAt: string;
}

export function generateTodayAstroSummary(): TodayAstroSummary {
  const today = new Date();
  
  // Create astro data for today at noon UTC (for consistent calculations)
  const todayAstroData: AstroData = {
    year: today.getUTCFullYear(),
    month: today.getUTCMonth() + 1, // JavaScript months are 0-indexed
    date: today.getUTCDate(),
    hours: 12, // Noon UTC for consistent calculations
    minutes: 0,
    seconds: 0,
    latitude: 0, // Use 0,0 for current planetary positions (geocentric)
    longitude: 0,
    timezone: 0, // UTC
    settings: {
      observation_point: 'geocentric',
      ayanamsha: 'lahiri'
    }
  };

  // Calculate today's planetary positions
  const todayChart = calculateAstro(todayAstroData);
  
  // Transform planets data into structured format
  const currentPlanets: Record<string, any> = {};
  Object.entries(todayChart.planets).forEach(([planet, data]: [string, any]) => {
    const signName = ZODIAC_SIGNS[data.sign - 1];
    currentPlanets[planet] = {
      name: planet.charAt(0).toUpperCase() + planet.slice(1),
      position: {
        degrees: data.position.degrees,
        minutes: data.position.minutes,
        seconds: data.position.seconds,
        longitude: data.position.longitude
      },
      sign: data.sign,
      signName: signName,
      retrograde: data.retrograde,
      speed: data.speed
    };
  });

  return {
    date: today.toISOString().split('T')[0], // YYYY-MM-DD format
    currentPlanets,
    currentInterpretations: {
      sunSign: todayChart.interpretations.sunSign,
      moonSign: todayChart.interpretations.moonSign,
      dominantElements: todayChart.interpretations.dominantElements,
      dominantQualities: todayChart.interpretations.dominantQualities
    },
    calculatedAt: today.toISOString()
  };
}

// Function to compare natal chart with today's transits
export interface TransitComparison {
  natalChart: NatalChartData;
  todayTransits: TodayAstroSummary;
  aspects: Record<string, {
    planet: string;
    aspect: string;
    orb: number;
    influence: 'harmonious' | 'challenging' | 'neutral';
  }[]>;
  summary: string;
}

export function compareNatalWithToday(
  natalChart: NatalChartData, 
  todayTransits: TodayAstroSummary
): TransitComparison {
  const aspects: Record<string, any[]> = {};
  
  // Calculate aspects between natal planets and current transits
  Object.entries(natalChart.planets).forEach(([natalPlanet, natalData]) => {
    const currentPlanet = todayTransits.currentPlanets[natalPlanet];
    if (currentPlanet) {
      const natalLongitude = natalData.position.longitude;
      const currentLongitude = currentPlanet.position.longitude;
      const orb = Math.abs(currentLongitude - natalLongitude);
      
      // Calculate aspect
      let aspect = '';
      let influence: 'harmonious' | 'challenging' | 'neutral' = 'neutral';
      
      if (orb <= 8) { // Conjunction
        aspect = 'conjunction';
        influence = 'neutral';
      } else if (Math.abs(orb - 60) <= 6) { // Sextile
        aspect = 'sextile';
        influence = 'harmonious';
      } else if (Math.abs(orb - 90) <= 8) { // Square
        aspect = 'square';
        influence = 'challenging';
      } else if (Math.abs(orb - 120) <= 8) { // Trine
        aspect = 'trine';
        influence = 'harmonious';
      } else if (Math.abs(orb - 180) <= 8) { // Opposition
        aspect = 'opposition';
        influence = 'challenging';
      }
      
      if (aspect) {
        if (!aspects[natalPlanet]) {
          aspects[natalPlanet] = [];
        }
        aspects[natalPlanet].push({
          planet: natalPlanet,
          aspect,
          orb: Math.round(orb * 10) / 10,
          influence
        });
      }
    }
  });

  // Generate summary based on aspects
  const harmoniousAspects = Object.values(aspects).flat().filter(a => a.influence === 'harmonious');
  const challengingAspects = Object.values(aspects).flat().filter(a => a.influence === 'challenging');
  
  let summary = `Today's astrological influences for your natal chart:\n\n`;
  
  if (harmoniousAspects.length > 0) {
    summary += `🌟 Harmonious aspects: ${harmoniousAspects.length} planets in supportive alignments\n`;
  }
  
  if (challengingAspects.length > 0) {
    summary += `⚡ Challenging aspects: ${challengingAspects.length} planets in tense alignments\n`;
  }
  
  summary += `\nCurrent Sun Sign: ${todayTransits.currentInterpretations.sunSign}\n`;
  summary += `Current Moon Sign: ${todayTransits.currentInterpretations.moonSign}\n`;
  summary += `Your Natal Sun: ${natalChart.interpretations.sunSign}\n`;
  summary += `Your Natal Moon: ${natalChart.interpretations.moonSign}`;

  return {
    natalChart,
    todayTransits,
    aspects,
    summary
  };
}

// Keep the original string function for backward compatibility
export function generateNatalChartReport(astroData: AstroData): string {
  const chart = calculateAstro(astroData);
  
  let report = `NATAL CHART REPORT\n`;
  report += `==================\n\n`;
  report += `Birth Information:\n`;
  report += `Date: ${chart.birthInfo.date}\n`;
  report += `Location: ${chart.birthInfo.latitude}°N, ${chart.birthInfo.longitude}°E\n`;
  report += `Timezone: UTC${chart.birthInfo.timezone >= 0 ? '+' : ''}${chart.birthInfo.timezone}\n\n`;

  report += `Planetary Positions:\n`;
  report += `==================\n`;
  Object.entries(chart.planets).forEach(([planet, data]: [string, any]) => {
    const signName = ZODIAC_SIGNS[data.sign - 1];
    const retrograde = data.retrograde ? ' (R)' : '';
    report += `${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${data.position.degrees}°${data.position.minutes}'${data.position.seconds}" ${signName}${retrograde}\n`;
  });

  report += `\nChart Patterns:\n`;
  report += `==============\n`;
  if (chart.chartPatterns.stelliums.length > 0) {
    report += `Stelliums: ${chart.chartPatterns.stelliums.join(', ')}\n`;
  }
  report += `Element Emphasis: ${Object.entries(chart.chartPatterns.elementEmphasis)
    .map(([element, count]) => `${element}: ${count}`)
    .join(', ')}\n`;
  report += `Quality Emphasis: ${Object.entries(chart.chartPatterns.qualityEmphasis)
    .map(([quality, count]) => `${quality}: ${count}`)
    .join(', ')}\n`;

  report += `\nInterpretations:\n`;
  report += `================\n`;
  report += `Sun Sign: ${chart.interpretations.sunSign}\n`;
  report += `Moon Sign: ${chart.interpretations.moonSign}\n`;
  report += `Rising Sign: ${chart.interpretations.risingSign}\n`;
  report += `Dominant Elements: ${chart.interpretations.dominantElements.join(', ')}\n`;
  report += `Dominant Qualities: ${chart.interpretations.dominantQualities.join(', ')}\n`;

  return report;
}

/**
 * Test function to verify calculation accuracy
 */
export function testAstroCalculation(): void {
  // Test with user's specific birth data
  const userBirthData: AstroData = {
    year: 1959,
    month: 9,
    date: 15,
    hours: 5,
    minutes: 50,
    seconds: 0,
    latitude: 43.6347, // Caledonia, Minnesota (43°N38'05")
    longitude: -91.4967, // Caledonia, Minnesota (091°W29'48")
    timezone: -6, // CST (UTC-6)
    settings: {
      observation_point: 'geocentric',
      ayanamsha: 'lahiri'
    }
  };

  try {
    console.log('🔮 Testing astrology calculation with user birth data...');
    console.log('Birth Date: September 15, 1959, 5:50 AM CST');
    console.log('Location: Caledonia, Minnesota (43.6347°N, 91.4967°W)');
    
    const chart = calculateAstro(userBirthData);
    
    console.log('\n📊 CALCULATION RESULTS:');
    console.log('Sun Sign:', chart.interpretations.sunSign);
    console.log('Moon Sign:', chart.interpretations.moonSign);
    console.log('Rising Sign:', chart.interpretations.risingSign);
    console.log('Planets calculated:', Object.keys(chart.planets).length);
    console.log('Houses calculated:', chart.houses.length);
    
    // Verify expected values for September 15, 1959
    const expectedSunSign = 'Virgo'; // September 15 should be Virgo
    if (chart.interpretations.sunSign === expectedSunSign) {
      console.log('✅ Sun sign calculation is accurate');
    } else {
      console.log(`❌ Sun sign calculation error: expected ${expectedSunSign}, got ${chart.interpretations.sunSign}`);
    }

    // Display detailed planetary positions
    console.log('\n🌍 PLANETARY POSITIONS:');
    Object.entries(chart.planets).forEach(([planet, data]: [string, any]) => {
      const signName = ZODIAC_SIGNS[data.sign - 1];
      const retrograde = data.retrograde ? ' (R)' : '';
      console.log(`${planet.toUpperCase()}: ${data.position.degrees}°${data.position.minutes}'${data.position.seconds}" ${signName}${retrograde}`);
    });

    // Display chart patterns
    console.log('\n📈 CHART PATTERNS:');
    if (chart.chartPatterns.stelliums.length > 0) {
      console.log('Stelliums:', chart.chartPatterns.stelliums.join(', '));
    }
    console.log('Element Emphasis:', Object.entries(chart.chartPatterns.elementEmphasis)
      .map(([element, count]) => `${element}: ${count}`)
      .join(', '));
    console.log('Quality Emphasis:', Object.entries(chart.chartPatterns.qualityEmphasis)
      .map(([quality, count]) => `${quality}: ${count}`)
      .join(', '));

    console.log('\n✅ Astrology calculation test successful!');
  } catch (error) {
    console.error('❌ Astrology calculation test failed:', error);
  }
}


