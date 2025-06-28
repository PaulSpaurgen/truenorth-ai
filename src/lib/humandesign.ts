// Human Design helper utilities
// This module converts ecliptic longitude (0° Aries = 0) into the corresponding Human Design gate (1–64).
// Gate widths are fixed (5.625°), but the sequence starts at Gate 25 (28°15' Pisces).
// The gateSequence array lists the gate numbers in zodiac order starting from that point.

const GATE_WIDTH = 5.625; // 360 / 64

// Starting point 28°15' Pisces = 330° + 28°15' = 358.25°
const GATE_START_OFFSET = 358.25; // degrees

// Gate numbers in order going forward through the zodiac from 28°15' Pisces
const gateSequence: number[] = [
  25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12,
  15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6,
  46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11,
  10, 58, 38, 54, 61, 60, 41, 19, 13, 49, 30, 55, 37, 63, 22, 36
];

/**
 * Convert an absolute ecliptic longitude (in degrees, 0° Aries = 0) into a Human Design gate number (1–64).
 * @param degree Absolute ecliptic longitude in the range [0, 360).
 */
export function longitudeToGate(degree: number): number {
  if (degree < 0 || degree >= 360) {
    throw new Error('Degree must be in the range 0 – <360');
  }

  // Shift so that 0 corresponds to the start of gate 25 (28°15 Pisces)
  const shifted = (degree - GATE_START_OFFSET + 360) % 360;
  const index = Math.floor(shifted / GATE_WIDTH);
  return gateSequence[index];
}

/**
 * Convenience helper – given sign index (1=Aries..12=Pisces) and degree inside sign, returns gate number.
 */
export function signDegreeToGate(sign: number, degreeInSign: number): number {
  const absolute = (sign - 1) * 30 + degreeInSign;
  return longitudeToGate(absolute);
} 