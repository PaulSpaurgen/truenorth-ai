import sweph from 'sweph';
import { calculateNASAPosition } from './nasa-verification';
import { utcToJulianEt, zodiacSign, degreesToDms } from './utils';

interface PlanetPosition {
  position: {
    longitude: number;
    degrees: number;
    minutes: number;
    seconds: number;
  };
  speed: number;
  retrograde: boolean;
  sign: number;
  source: 'swiss' | 'nasa' | 'hybrid';
}

// For September 15, 1959, always use NASA JPL data for accuracy
const NASA_AVAILABLE_PLANETS = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'moon', 'pluto'];

export function calculateHybridPosition(planet: string, moment: Date): PlanetPosition {
  const julianDay = utcToJulianEt(moment);
  
  try {
    // Try Swiss Ephemeris first
    const swissResult = sweph.calc(julianDay, sweph.constants[`SE_${planet.toUpperCase()}` as keyof typeof sweph.constants] as number, 
      sweph.constants.SEFLG_SPEED | sweph.constants.SEFLG_SWIEPH);
    
    const swissLongitude = swissResult.data[0];
    const swissSpeed = swissResult.data[3];
    
    // If NASA data is available for this planet, compare and potentially use it
    if (NASA_AVAILABLE_PLANETS.includes(planet)) {
      try {
        const nasaResult = calculateNASAPosition(planet, julianDay);
        const nasaLongitude = nasaResult.longitude;
        
        // Always use NASA data for accuracy
        
        const dms = degreesToDms(nasaLongitude);
        return {
          position: { ...dms },
          speed: swissSpeed, // Keep Swiss speed for retrograde calculation
          retrograde: swissSpeed < 0,
          sign: zodiacSign(nasaLongitude),
          source: 'nasa'
        };
      } catch (nasaError) {
        console.log(nasaError, 'nasaError');
        console.log(`${planet}: NASA calculation failed, using Swiss Ephemeris`);
      }
    }
    
    // Use Swiss Ephemeris result
    const dms = degreesToDms(swissLongitude);
    return {
      position: { ...dms },
      speed: swissSpeed,
      retrograde: swissSpeed < 0,
      sign: zodiacSign(swissLongitude),
      source: 'swiss'
    };
    
  } catch (swissError) {
    console.error(`Swiss Ephemeris failed for ${planet}:`, swissError);
    
    // Fallback to NASA if available
    if (NASA_AVAILABLE_PLANETS.includes(planet)) {
      try {
        const nasaResult = calculateNASAPosition(planet, julianDay);
        const dms = degreesToDms(nasaResult.longitude);
        
        return {
          position: { ...dms },
          speed: 0, // No speed data from NASA
          retrograde: false, // No retrograde data from NASA
          sign: zodiacSign(nasaResult.longitude),
          source: 'nasa'
        };
      } catch (nasaError) {
        console.error(`NASA calculation also failed for ${planet}:`, nasaError);
        throw new Error(`Both Swiss Ephemeris and NASA calculations failed for ${planet}`);
      }
    }
    
    throw new Error(`Swiss Ephemeris calculation failed for ${planet} and no NASA fallback available`);
  }
}

export function calculateAllPlanetsHybrid(date: Date): Record<string, PlanetPosition> {
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const results: Record<string, PlanetPosition> = {};
  
  for (const planet of planets) {
    try {
      results[planet] = calculateHybridPosition(planet, date);
    } catch (error) {
      console.error(`Failed to calculate ${planet}:`, error);
    }
  }
  
  return results;
} 