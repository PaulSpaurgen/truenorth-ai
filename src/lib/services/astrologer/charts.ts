import { houses } from './houses';
import { aspects } from './aspects';
import { planets } from './astros';



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
  type: string;
}

interface Aspect {
  name: string;
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

interface HousePosition {
  position: {
    degrees: number;
    minutes: number;
    seconds: number;
    longitude: number;
  };
  sign: number;
}

interface Axes {
  asc?: HousePosition;
  dc?: HousePosition;
  mc?: HousePosition;
  ic?: HousePosition;
}


interface NatalChart {
  astros: Record<string, PlanetData>;
  axes: Axes;
  houses: HousePosition[];
  aspects: Record<string, Aspect[]>;
}

export const natalChart = (
  date: Date, 
  latitude: number, 
  longitude: number, 
  houseSystem: string = 'P'
): NatalChart => {
  const astrosList = planets(date);
  const aspectsList = aspects(astrosList);
  const housesList = houses(
    date,
    {
      latitude: parseFloat(latitude.toString()),
      longitude: parseFloat(longitude.toString())
    },
    houseSystem
  );

  return {
    astros: {
      ...astrosList
    },
    ...housesList,
    aspects: aspectsList
  };
}; 