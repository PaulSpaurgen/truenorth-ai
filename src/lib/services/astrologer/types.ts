// Core types for astrology calculations
export interface AstroData {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  seconds: number;
  latitude: number;
  longitude: number;
  timezone: number;
  settings: {
    observation_point: 'topocentric' | 'geocentric';
    ayanamsha: 'lahiri' | 'raman' | 'krishnamurti' | 'sayan';
  };
}

export interface DmsPosition {
  degrees: number;
  minutes: number;
  seconds: number;
  longitude: number;
}

export interface PlanetPosition {
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

export interface PlanetData {
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

export type PlanetType = 'luminary' | 'personal' | 'social' | 'transpersonal' | 'other';

export interface HousePosition {
  position: {
    degrees: number;
    minutes: number;
    seconds: number;
    longitude: number;
  };
  sign: number;
}

export interface Axes {
  asc?: HousePosition;
  dc?: HousePosition;
  mc?: HousePosition;
  ic?: HousePosition;
}

export interface HousesResult {
  axes: Axes;
  houses: HousePosition[];
}

export interface Aspect {
  name: AspectName;
  direction: 'bidirectional' | 'unidirectional';
  first: {
    name: string;
    exist: boolean;
  };
  second: {
    name: string;
    exist: boolean;
  };
}

export type AspectName = 'conjunction' | 'semisextile' | 'sextile' | 'quadrature' | 'trigone' | 'quincunx' | 'opposition';

export interface NatalChart {
  astros: Record<string, PlanetData>;
  axes: Axes;
  houses: HousePosition[];
  aspects: Record<string, Aspect[]>;
}

// Zodiac sign names
export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

// Planet symbols
export const PLANET_SYMBOLS = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  chiron: '⚷',
  lilith: '⚸',
  ceres: '⚳',
  vesta: '⚶',
  pallas: '⚴',
  juno: '⚵'
} as const;

export type PlanetName = keyof typeof PLANET_SYMBOLS; 