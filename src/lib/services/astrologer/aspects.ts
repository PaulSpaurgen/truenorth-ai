import { normalizeDegrees } from './utils';

const ASPECTS = {
  0: 'conjunction',
  30: 'semisextile',
  60: 'sextile',
  90: 'quadrature',
  120: 'trigone',
  150: 'quincunx',
  180: 'opposition'
} as const;

type AspectName = typeof ASPECTS[keyof typeof ASPECTS];

// HUBER ORBS... but mars and jupiter modified...
const DEFAULT_ORBS = {
  luminary: {
    0: 10,
    30: 3,
    60: 5,
    90: 6,
    120: 8,
    150: 5,
    180: 10
  },
  personal: {
    0: 7,
    30: 2,
    60: 4,
    90: 5,
    120: 6,
    150: 2,
    180: 7
  },
  social: {
    0: 6,
    30: 1.5,
    60: 3,
    90: 4,
    120: 5,
    150: 3,
    180: 6
  },
  transpersonal: {
    0: 5,
    30: 1,
    60: 2,
    90: 3,
    120: 4,
    150: 2,
    180: 5
  },
  other: {
    0: 5,
    30: 1,
    60: 2,
    90: 3,
    120: 4,
    150: 2,
    180: 5
  }
} as const;

type PlanetType = keyof typeof DEFAULT_ORBS;

interface Planet {
  name: string;
  type: PlanetType;
  position: {
    longitude: number;
  };
}

interface Aspect {
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

interface AspectOrbs {
  [key: string]: {
    [key: number]: number;
  };
}

const calculateAspect = (first: Planet, second: Planet, orbs: Record<number, number>): number[] => {
  return Object.keys({ ...ASPECTS }).filter(
    (a) => {
      const totalOrbsForAspect = orbs[parseInt(a)];
      const from = parseFloat(a) - (totalOrbsForAspect / 2);
      const to = parseFloat(a) + (totalOrbsForAspect / 2);

      const firstLongitude = normalizeDegrees(first.position.longitude);
      const secondLongitude = normalizeDegrees(second.position.longitude);

      const diff = Math.abs(firstLongitude - secondLongitude);
      return diff >= from && diff <= to;
    }
  ).map(a => parseInt(a));
};

export const aspect = (first: Planet, second: Planet, orbs?: AspectOrbs): Aspect | undefined => {
  if (orbs === undefined) {
    orbs = { ...DEFAULT_ORBS };
  }

  const aspectsFirst = calculateAspect(first, second, orbs[first.type]);
  const aspectsSecond = calculateAspect(first, second, orbs[second.type]);

  if (aspectsFirst.length === 0 && aspectsSecond.length === 0) {
    return undefined;
  }

  const direction = aspectsFirst.length === 1 && aspectsSecond.length === 1 ? 'bidirectional' : 'unidirectional';

  return {
    name: ASPECTS[aspectsFirst[0] as keyof typeof ASPECTS],
    direction,
    first: {
      name: first.name,
      exist: aspectsFirst.length === 1
    },
    second: {
      name: second.name,
      exist: aspectsSecond.length === 1
    }
  };
};

export const aspects = (planets: Record<string, Planet>): Record<string, Aspect[]> => {
  return Object.keys(planets).reduce((acc, planetKey) => {
    acc[planetKey] = [];

    Object.values(planets).filter((p) => p.name !== planetKey).forEach((p) => {
      if (!acc[p.name]) {
        const aspectsFounds = aspect(planets[planetKey], p);
        if (aspectsFounds) {
          acc[planetKey].push(aspectsFounds);
        }
      }
    });

    return acc;
  }, {} as Record<string, Aspect[]>);
}; 