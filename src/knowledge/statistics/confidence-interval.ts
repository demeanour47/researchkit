/**
 * Confidence intervals for six common quantities, from summary statistics. Pure and
 * deterministic; every result keeps full precision, and the working behind it, so an
 * interface can show how it was produced. Inputs are assumed valid (see
 * confidence-interval-request.ts, which checks them).
 *
 * Methods (each checked against published values or an independent implementation;
 * see confidence-interval.test.ts)
 * - One mean, and the mean of paired differences: the t interval
 *   x̄ ± t(1 − α/2, n − 1) × s / √n (Student, 1908; NIST/SEMATECH e-Handbook of
 *   Statistical Methods, §1.3.5.2).
 * - Difference between two independent means: Welch's interval, which doesn't assume
 *   equal variances: (x̄₁ − x̄₂) ± t(1 − α/2, ν) × √(s₁²/n₁ + s₂²/n₂), with the
 *   Welch–Satterthwaite degrees of freedom
 *   ν = (s₁²/n₁ + s₂²/n₂)² / ((s₁²/n₁)²/(n₁ − 1) + (s₂²/n₂)²/(n₂ − 1)) (Welch, 1947).
 * - One proportion: the Wilson score interval,
 *   (x + z²/2 ± z √(x(n − x)/n + z²/4)) / (n + z²) (Wilson, 1927), recommended over
 *   the simple Wald interval p̂ ± z √(p̂(1 − p̂)/n) (Newcombe, 1998a). It stays within
 *   [0, 1] and works with 0 or n successes.
 * - Difference between two independent proportions: Newcombe's hybrid score
 *   interval (Newcombe, 1998b, method 10), from the Wilson limits lᵢ, uᵢ of each
 *   proportion: L = d − √((p̂₁ − l₁)² + (u₂ − p̂₂)²), U = d + √((u₁ − p̂₁)² + (p̂₂ − l₂)²),
 *   where d = p̂₁ − p̂₂. Recommended by Fagerland et al. (2015).
 * - Pearson correlation: Fisher's z transformation z = artanh r, whose standard
 *   error is approximately 1/√(n − 3); the interval artanh r ± z(1 − α/2)/√(n − 3)
 *   is transformed back with tanh (Fisher, 1921).
 */

import { normalUpperQuantile, studentTUpperQuantile } from "./distributions";

export const CI_METHODS = ["one-mean", "two-means", "paired-mean", "one-proportion", "two-proportions", "correlation"] as const;
export type CiMethod = (typeof CI_METHODS)[number];

/** Reads a method from untrusted input, such as a form value. Null if it isn't supported. */
export function parseCiMethod(value: unknown): CiMethod | null {
  return CI_METHODS.find((method) => method === value) ?? null;
}

/** The confidence levels the calculator offers. Any level strictly between 0 and 1 can be calculated. */
export const CONFIDENCE_LEVELS = [0.9, 0.95, 0.99] as const;

/** The critical value an interval used: a t quantile with its degrees of freedom, or a standard normal quantile. */
export type CriticalValue = { distribution: "t"; df: number; value: number } | { distribution: "z"; value: number };

interface IntervalBase {
  confidence: number;
  /** α = 1 − confidence level. */
  alpha: number;
  estimate: number;
  lower: number;
  upper: number;
  critical: CriticalValue;
}

/** An interval of the form estimate ± critical value × standard error. */
export interface SymmetricInterval extends IntervalBase {
  kind: "symmetric";
  standardError: number;
  margin: number;
}

/** The Wilson score interval, which is centred on a value pulled towards ½, not on p̂. */
export interface WilsonInterval extends IntervalBase {
  kind: "wilson";
  successes: number;
  n: number;
  /** (x + z²/2) / (n + z²). */
  centre: number;
  /** z √(x(n − x)/n + z²/4) / (n + z²). */
  halfWidth: number;
}

/** Newcombe's interval for p₁ − p₂, built from the Wilson interval of each proportion. */
export interface NewcombeInterval extends IntervalBase {
  kind: "newcombe";
  groups: [WilsonInterval, WilsonInterval];
  /** √((p̂₁ − l₁)² + (u₂ − p̂₂)²): the distance from the estimate to the lower limit. */
  below: number;
  /** √((u₁ − p̂₁)² + (p̂₂ − l₂)²): the distance from the estimate to the upper limit. */
  above: number;
}

/** Fisher's interval for a correlation, symmetric on the z scale and transformed back to r. */
export interface FisherInterval extends IntervalBase {
  kind: "fisher";
  n: number;
  /** artanh r. */
  z: number;
  /** 1/√(n − 3), on the z scale. */
  standardError: number;
  /** Critical value × standard error, on the z scale. */
  margin: number;
  zLower: number;
  zUpper: number;
}

export type ConfidenceInterval = SymmetricInterval | WilsonInterval | NewcombeInterval | FisherInterval;

const alphaOf = (confidence: number) => 1 - confidence;
/** The two-sided standard normal critical value z(1 − α/2). */
export const zCritical = (confidence: number) => normalUpperQuantile(alphaOf(confidence) / 2);
/** The two-sided t critical value t(1 − α/2, df). */
export const tCritical = (confidence: number, df: number) => studentTUpperQuantile(alphaOf(confidence) / 2, df);

/** The t interval for a mean, or for the mean of paired differences: x̄ ± t(1 − α/2, n − 1) × s/√n. */
export function meanInterval(mean: number, sd: number, n: number, confidence: number): SymmetricInterval {
  const df = n - 1;
  const value = tCritical(confidence, df);
  const standardError = sd / Math.sqrt(n);
  const margin = value * standardError;
  return { kind: "symmetric", confidence, alpha: alphaOf(confidence), estimate: mean, lower: mean - margin, upper: mean + margin, critical: { distribution: "t", df, value }, standardError, margin };
}

export interface GroupSummary {
  mean: number;
  sd: number;
  n: number;
}

/** The Welch–Satterthwaite degrees of freedom for two groups' variances of the mean. */
export function welchDf(group1: GroupSummary, group2: GroupSummary): number {
  const v1 = (group1.sd * group1.sd) / group1.n;
  const v2 = (group2.sd * group2.sd) / group2.n;
  return (v1 + v2) ** 2 / ((v1 * v1) / (group1.n - 1) + (v2 * v2) / (group2.n - 1));
}

/** Welch's interval for μ₁ − μ₂. At least one standard deviation must be positive. */
export function welchInterval(group1: GroupSummary, group2: GroupSummary, confidence: number): SymmetricInterval {
  const df = welchDf(group1, group2);
  const value = tCritical(confidence, df);
  const standardError = Math.sqrt((group1.sd * group1.sd) / group1.n + (group2.sd * group2.sd) / group2.n);
  const margin = value * standardError;
  const estimate = group1.mean - group2.mean;
  return { kind: "symmetric", confidence, alpha: alphaOf(confidence), estimate, lower: estimate - margin, upper: estimate + margin, critical: { distribution: "t", df, value }, standardError, margin };
}

/** The Wilson score interval for x successes in n trials. */
export function wilsonInterval(successes: number, n: number, confidence: number): WilsonInterval {
  const z = zCritical(confidence);
  const z2 = z * z;
  const centre = (successes + z2 / 2) / (n + z2);
  const halfWidth = (z * Math.sqrt((successes * (n - successes)) / n + z2 / 4)) / (n + z2);
  // At 0 or n successes the limit is exactly 0 or 1; floating point can land just outside.
  const lower = successes === 0 ? 0 : Math.max(0, centre - halfWidth);
  const upper = successes === n ? 1 : Math.min(1, centre + halfWidth);
  return { kind: "wilson", confidence, alpha: alphaOf(confidence), estimate: successes / n, lower, upper, critical: { distribution: "z", value: z }, successes, n, centre, halfWidth };
}

/** Newcombe's hybrid score interval for p₁ − p₂ (method 10). */
export function newcombeInterval(successes1: number, n1: number, successes2: number, n2: number, confidence: number): NewcombeInterval {
  const first = wilsonInterval(successes1, n1, confidence);
  const second = wilsonInterval(successes2, n2, confidence);
  const estimate = first.estimate - second.estimate;
  const below = Math.hypot(first.estimate - first.lower, second.upper - second.estimate);
  const above = Math.hypot(first.upper - first.estimate, second.estimate - second.lower);
  return {
    kind: "newcombe",
    confidence,
    alpha: alphaOf(confidence),
    estimate,
    // A difference of proportions lies in [−1, 1]; the limits never leave it, except by a rounding error.
    lower: Math.max(-1, estimate - below),
    upper: Math.min(1, estimate + above),
    critical: first.critical,
    groups: [first, second],
    below,
    above,
  };
}

/** Fisher's z interval for a Pearson correlation r from n pairs; −1 < r < 1 and n ≥ 4. */
export function correlationInterval(r: number, n: number, confidence: number): FisherInterval {
  const value = zCritical(confidence);
  const z = Math.atanh(r);
  const standardError = 1 / Math.sqrt(n - 3);
  const margin = value * standardError;
  const zLower = z - margin;
  const zUpper = z + margin;
  return { kind: "fisher", confidence, alpha: alphaOf(confidence), estimate: r, lower: Math.tanh(zLower), upper: Math.tanh(zUpper), critical: { distribution: "z", value }, n, z, standardError, margin, zLower, zUpper };
}
