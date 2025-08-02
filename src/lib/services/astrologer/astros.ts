import sweph from 'sweph';
import path from 'path';
import { utcToJulianEt, zodiacSign, degreesToDms } from './utils';

const _require = eval('require');
const swephPackageDir = path.dirname(_require.resolve('sweph'));
// Point to the ephemeris directory shipped inside the `sweph` package itself.
sweph.set_ephe_path(path.join(swephPackageDir, 'eph'));

const {
  SE_SUN,
  SE_MOON,
  SE_MEAN_APOG,
  SE_MERCURY,
  SE_VENUS,
  SE_MARS,
  SE_JUPITER,
  SE_SATURN,
  SE_URANUS,
  SE_NEPTUNE,
  SE_PLUTO,
  SE_VESTA,
  SE_JUNO,
  SE_CHIRON,
  SE_CERES,
  SE_PALLAS,
  SEFLG_SWIEPH,
  SEFLG_SPEED
} = sweph.constants;

export const PLANETS = {
  sun: SE_SUN,
  moon: SE_MOON,
  mercury: SE_MERCURY,
  venus: SE_VENUS,
  mars: SE_MARS,
  jupiter: SE_JUPITER,
  saturn: SE_SATURN,
  uranus: SE_URANUS,
  neptune: SE_NEPTUNE,
  pluto: SE_PLUTO,
  chiron: SE_CHIRON,
  lilith: SE_MEAN_APOG,
  ceres: SE_CERES,
  vesta: SE_VESTA,
  pallas: SE_PALLAS,
  juno: SE_JUNO
} as const;

export const planetsByType = {
  sun: 'luminary',
  moon: 'luminary',
  mercury: 'personal',
  venus: 'personal',
  mars: 'personal',
  jupiter: 'social',
  saturn: 'social',
  uranus: 'transpersonal',
  neptune: 'transpersonal',
  pluto: 'transpersonal',
  chiron: 'other',
  lilith: 'other',
  ceres: 'other',
  vesta: 'other',
  pallas: 'other',
  juno: 'other'
} as const;

export type PlanetType = typeof planetsByType[keyof typeof planetsByType];
export type PlanetName = keyof typeof PLANETS;

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
}

interface PlanetData {
  name: string;
  position: {
    longitude: number;
    degrees: number;
    minutes: number;
    seconds: number;
  };
  speed: number;
  retrograde: boolean;
  sign: number;
  type: PlanetType;
}

const FLAG = SEFLG_SPEED | SEFLG_SWIEPH;

const getPositionOfAstro = (astro: PlanetName, julianDay: number) => 
  sweph.calc(julianDay, PLANETS[astro], FLAG);

const isRetrograde = (speed: number): boolean => speed < 0;

export const position = (astrologyObject: PlanetName, moment: Date): PlanetPosition => {
  const julianDay = utcToJulianEt(moment);
  const { data } = getPositionOfAstro(astrologyObject, julianDay);
  const longitude = data[0];
  const speed = data[3];
  const dms = degreesToDms(longitude);
  const retrograde = isRetrograde(speed);



  return {
    position: {
      ...dms
    },
    speed,
    retrograde,
    sign: zodiacSign(longitude)
  };
};

export const planets = (date: Date): Record<string, PlanetData> => {
  return Object.keys(PLANETS)
    .reduce(
      (accumulator, name) => {
        const planetPosition = position(name as PlanetName, date);
        accumulator[name] = {
          name,
          ...planetPosition,
          type: planetsByType[name as PlanetName]
        };
        return accumulator;
      },
      {} as Record<string, PlanetData>
    );
}; 