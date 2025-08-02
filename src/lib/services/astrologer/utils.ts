import sweph from 'sweph';
import path from 'path';


// Resolve Swiss Ephemeris data files from the installed `sweph` package so that
// the ephemeris files are always available in every environment (local, Vercel
// serverless, etc.). Using `require.resolve` gives us the absolute path to the
// installed package inside `node_modules`, which is included automatically in
// the serverless bundle, whereas relative paths like "../../eph" can break
// after Next.js compiles to `.next/server`.
// Use eval to access `require` without allowing Webpack to statically analyse
// and replace `require.resolve` with a numeric module ID during the build. This
// keeps the call working both in development and in the serverless runtime.
const _require = eval('require');
const swephPackageDir = path.dirname(_require.resolve('sweph'));
const ephPath = path.join(swephPackageDir, 'eph');

// Point Swiss-Ephemeris at the bundled ephemeris directory.
sweph.set_ephe_path(ephPath);

interface DmsPosition {
  degrees: number;
  minutes: number;
  seconds: number;
  longitude: number;
}

export const utcToJulianUt = (utcDate: Date): number => {
  // For September 15, 1959, 5:50 AM CST = 11:50 AM UTC
  // The correct Julian Day should be around 2436800.5 + 0.4930556 = 2436800.9930556
  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth() + 1;
  const day = utcDate.getUTCDate();
  const hour = utcDate.getUTCHours();
  const minute = utcDate.getUTCMinutes();
  const second = utcDate.getUTCSeconds();
  
  const hours = hour + (minute / 60) + (second / 3600);

  const julianDay = sweph.julday(year, month, day, hours, sweph.constants.SE_GREG_CAL);
  return julianDay;
};

export const utcToJulianEt = (utcDate: Date): number => {
  const julianUt = utcToJulianUt(utcDate);
  const delta = sweph.deltat(julianUt);
  return julianUt + delta;
};

export const degreesToDms = (value: number): DmsPosition => {
  // Normalize to 0-360 range
  let normalized = value % 360;
  if (normalized < 0) normalized += 360;
  
  // Calculate degrees within the sign (0-29)
  const degrees = Math.floor(normalized % 30);
  
  // Calculate minutes and seconds
  const decimalPart = normalized % 1;
  const minutes = Math.floor(decimalPart * 60);
  const seconds = Math.floor((decimalPart * 60 - minutes) * 60);
  
  return {
    degrees,
    minutes,
    seconds,
    longitude: value
  };
};

export const zodiacSign = (degrees: number): number => {
  // Normalize degrees to 0-360 range
  let normalized = degrees % 360;
  if (normalized < 0) normalized += 360;
  
  // Calculate sign (0-11 for Aries through Pisces)
  const sign = Math.floor(normalized / 30);
  
  // Return 1-based sign number (1-12)
  return sign + 1;
};

export const normalizeDegrees = (degrees: number): number => {
  if (degrees < -180) {
    return degrees + 360;
  }
  if (degrees > 180) {
    return degrees - 360;
  }

  return degrees;
}; 