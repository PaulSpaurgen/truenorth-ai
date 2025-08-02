import sweph from 'sweph';
import path from 'path';
import { utcToJulianUt, degreesToDms, zodiacSign } from './utils';

const _require = eval('require');
const swephPackageDir = path.dirname(_require.resolve('sweph'));
// Point Swiss-Ephemeris to its packaged ephemeris files so it works in a
// serverless bundle.
sweph.set_ephe_path(path.join(swephPackageDir, 'eph'));

interface Position {
  latitude: number;
  longitude: number;
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

interface HousesResult {
  axes: Axes;
  houses: HousePosition[];
}

export const houses = (date: Date, position: Position, houseSystem: string = 'P'): HousesResult => {
  const julianDayUT = utcToJulianUt(date);

  const withoutGeoposition = !(position?.latitude && position?.longitude);

  if (withoutGeoposition) {
    return {
      axes: {
        asc: undefined,
        dc: undefined,
        mc: undefined,
        ic: undefined
      },
      houses: []
    };
  }

  const { houses: housesPositions } = sweph.houses(
    julianDayUT,
    position.latitude,
    position.longitude,
    houseSystem // placidus system...
  ).data;

  const houseCollection = housesPositions.map((cuspid: number) => ({ 
    position: degreesToDms(cuspid), 
    sign: zodiacSign(cuspid) 
  }));

  const axes = {
    asc: houseCollection[0], 
    dc: houseCollection[6], 
    mc: houseCollection[9], 
    ic: houseCollection[3]
  };

  return {
    axes,
    houses: houseCollection
  };
}; 