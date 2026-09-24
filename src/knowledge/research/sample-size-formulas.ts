/**
 * The sample size formulas, as pure functions of plain numbers. Proportions and
 * margins are fractions here (0.05, not 5%); callers convert. Results are unrounded.
 */

import { CONFIDENCE_LEVELS, type ConfidenceLevel } from "./sample-size-types";

/** Floating-point results such as 550.0000000001 must round to 550, not 551. */
const EPSILON = 1e-9;

/** Rounds up to a whole number, the convention for sample sizes, so the target precision is met. */
export const roundUp = (value: number) => Math.ceil(value - EPSILON);
/** Rounds down, ignoring floating-point noise. */
export const roundDown = (value: number) => Math.floor(value + EPSILON);
/** Rounds to the nearest whole number, halves upwards, as the Krejcie and Morgan table does. */
export const roundNearest = (value: number) => Math.floor(value + 0.5 + EPSILON);

/** The z-score for a confidence level, from the table of supported levels. */
export function zScore(confidence: ConfidenceLevel): number {
  const entry = CONFIDENCE_LEVELS.find((candidate) => candidate.level === confidence);
  if (!entry) throw new RangeError(`Unsupported confidence level: ${confidence}`);
  return entry.z;
}

/** Cochran: n₀ = z² p (1 − p) ÷ e². */
export const cochran = (z: number, p: number, e: number) => (z * z * p * (1 - p)) / (e * e);

/** Finite population correction: n = n₀ ÷ (1 + (n₀ − 1) ÷ N). */
export const finitePopulationCorrection = (n0: number, N: number) => n0 / (1 + (n0 - 1) / N);

/** Yamane (and Slovin): n = N ÷ (1 + N e²). */
export const yamane = (N: number, e: number) => N / (1 + N * e * e);

/** Krejcie and Morgan: s = X² N P (1 − P) ÷ (d² (N − 1) + X² P (1 − P)), with X² = z². */
export const krejcieMorgan = (N: number, z: number, P: number, d: number) => {
  const chiSquare = z * z;
  return (chiSquare * N * P * (1 - P)) / (d * d * (N - 1) + chiSquare * P * (1 - P));
};
