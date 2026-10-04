/**
 * Power analysis for seven common designs: required sample size, power for a planned
 * sample, and the minimum detectable effect. Pure and deterministic.
 *
 * Methods (each checked against published reference values; see power.test.ts)
 * - Means (one sample, paired, two independent groups): the t test's exact power from
 *   the noncentral t distribution, as G*Power computes it (Faul et al., 2007; G*Power
 *   3.1 manual, sections 19–21). df = N − 1 and δ = d√N for one sample and dz√N for
 *   pairs; df = N − 2 and δ = d√(n₁n₂ / (n₁ + n₂)) for two groups, here with n₁ = n₂.
 * - One-way ANOVA: the F test's exact power from the noncentral F distribution with
 *   λ = f²N, df = (k − 1, N − k), equal group sizes (G*Power manual, section 10).
 * - Correlation (H0: ρ = ρ₀): Fisher's z large-sample approximation; the test
 *   statistic is normal with mean (z(ρ) − z(ρ₀))√(N − 3), z(r) = ½ ln((1 + r)/(1 − r))
 *   (G*Power manual, section 3, "large sample approximation").
 * - Proportions (one sample, two independent groups): Cohen's arcsine method with
 *   h = 2 arcsin √p₁ − 2 arcsin √p₂, a normal approximation; the statistic has mean
 *   h√n for one sample and h√(n/2) for two groups of n each (Cohen, 1988, ch. 6;
 *   the R pwr package's pwr.p.test and pwr.2p.test).
 *
 * Two-sided power counts both rejection regions. One-sided tests are in the
 * direction of the specified effect. Required sample sizes are the smallest whole
 * numbers that reach the target power, so they are never rounded down; for two-group
 * designs and ANOVA, every group has the same size.
 */

import { bisect, noncentralFUpper, noncentralTCdf, normalUpper, normalUpperQuantile, fUpperQuantile, studentTUpperQuantile } from "./distributions";

export const DESIGNS = ["one-sample-mean", "two-means", "paired-means", "one-proportion", "two-proportions", "correlation", "anova"] as const;
export type Design = (typeof DESIGNS)[number];

/** Reads a design from untrusted input, such as a form value. Null if it isn't supported. */
export function parseDesign(value: unknown): Design | null {
  return DESIGNS.find((design) => design === value) ?? null;
}

export const MODES = ["sample-size", "power", "effect"] as const;
export type Mode = (typeof MODES)[number];

export type Tails = "two-sided" | "one-sided";

/** The largest sample size the calculator searches; larger requirements are reported, not estimated. */
export const MAX_SAMPLE_SIZE = 10_000_000;
/** The most groups a one-way ANOVA may have here. */
export const MAX_GROUPS = 100;

export interface DesignInfo {
  /** The sample size the user enters and the result reports: in total, in each group, or in pairs. */
  sampleUnit: "total" | "per-group" | "pairs";
  /** The smallest sample size the method can use. */
  minimumSample: number;
  /** Whether a one-sided test is meaningful for the design. */
  directional: boolean;
  /** Whether the design has a group count. */
  hasGroups: boolean;
  /** Whether the effect is given as proportions, a correlation, or a standardized effect size. */
  effectInput: "standardized" | "proportions" | "correlation";
}

export const DESIGN_INFO: Record<Design, DesignInfo> = {
  "one-sample-mean": { sampleUnit: "total", minimumSample: 2, directional: true, hasGroups: false, effectInput: "standardized" },
  "two-means": { sampleUnit: "per-group", minimumSample: 2, directional: true, hasGroups: false, effectInput: "standardized" },
  "paired-means": { sampleUnit: "pairs", minimumSample: 2, directional: true, hasGroups: false, effectInput: "standardized" },
  "one-proportion": { sampleUnit: "total", minimumSample: 1, directional: true, hasGroups: false, effectInput: "proportions" },
  "two-proportions": { sampleUnit: "per-group", minimumSample: 1, directional: true, hasGroups: false, effectInput: "proportions" },
  correlation: { sampleUnit: "total", minimumSample: 4, directional: true, hasGroups: false, effectInput: "correlation" },
  anova: { sampleUnit: "per-group", minimumSample: 2, directional: false, hasGroups: true, effectInput: "standardized" },
};

/** The parameters of a calculation, already validated. */
export interface PowerParameters {
  design: Design;
  alpha: number;
  tails: Tails;
  /** Cohen's d, dz or f, or h (proportions), or the correlation's z-difference, as a positive magnitude. */
  effect: number;
  /** Number of groups, for ANOVA. */
  groups: number;
}

/** Fisher's z transformation. */
export const fisherZ = (r: number) => 0.5 * Math.log((1 + r) / (1 - r));

/** Cohen's h for two proportions: 2 arcsin √p₁ − 2 arcsin √p₂. */
export const cohensH = (p1: number, p2: number) => 2 * Math.asin(Math.sqrt(p1)) - 2 * Math.asin(Math.sqrt(p2));

/** Power of a z test whose statistic has mean `shift` (≥ 0) under the alternative. */
function normalPower(shift: number, alpha: number, tails: Tails): number {
  if (tails === "one-sided") return normalUpper(normalUpperQuantile(alpha) - shift);
  const critical = normalUpperQuantile(alpha / 2);
  return normalUpper(critical - shift) + (1 - normalUpper(-critical - shift));
}

/** Power of a t test with df degrees of freedom and noncentrality δ (≥ 0). */
function tPower(df: number, delta: number, alpha: number, tails: Tails): number {
  if (tails === "one-sided") return 1 - noncentralTCdf(studentTUpperQuantile(alpha, df), df, delta);
  const critical = studentTUpperQuantile(alpha / 2, df);
  return 1 - noncentralTCdf(critical, df, delta) + noncentralTCdf(-critical, df, delta);
}

/**
 * Power for a sample size: n in total for one sample, correlation; pairs for paired
 * means; per group for two groups and ANOVA. The effect is a positive magnitude.
 */
export function powerFor(parameters: PowerParameters, n: number): number {
  // Two tails summed in floating point can exceed 1 by a rounding error; power is a probability.
  return Math.min(1, Math.max(0, unclampedPower(parameters, n)));
}

function unclampedPower(parameters: PowerParameters, n: number): number {
  const { design, alpha, tails, effect, groups } = parameters;
  switch (design) {
    case "one-sample-mean":
    case "paired-means":
      return tPower(n - 1, effect * Math.sqrt(n), alpha, tails);
    case "two-means":
      return tPower(2 * n - 2, effect * Math.sqrt(n / 2), alpha, tails);
    case "one-proportion":
      return normalPower(effect * Math.sqrt(n), alpha, tails);
    case "two-proportions":
      return normalPower(effect * Math.sqrt(n / 2), alpha, tails);
    case "correlation":
      return normalPower(effect * Math.sqrt(n - 3), alpha, tails);
    case "anova": {
      const total = n * groups;
      const df2 = total - groups;
      return noncentralFUpper(fUpperQuantile(alpha, groups - 1, df2), groups - 1, df2, effect * effect * total);
    }
  }
}

export type SampleSizeOutcome = { ok: true; n: number; power: number } | { ok: false; reason: "too-large" };

/** The smallest sample size (in the design's unit) whose power reaches the target. */
export function requiredSampleSize(parameters: PowerParameters, targetPower: number): SampleSizeOutcome {
  const minimum = DESIGN_INFO[parameters.design].minimumSample;
  const reaches = (n: number) => powerFor(parameters, n) >= targetPower;
  if (reaches(minimum)) return { ok: true, n: minimum, power: powerFor(parameters, minimum) };
  let low = minimum;
  let high = minimum * 2;
  while (!reaches(high)) {
    if (high >= MAX_SAMPLE_SIZE) return { ok: false, reason: "too-large" };
    low = high;
    high = Math.min(high * 2, MAX_SAMPLE_SIZE);
  }
  // low fails and high reaches the target: narrow down to the first whole number that reaches it.
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if (reaches(mid)) high = mid;
    else low = mid;
  }
  return { ok: true, n: high, power: powerFor(parameters, high) };
}

/** The largest effect a search considers, in the design's effect metric. */
const EFFECT_CEILING: Record<Design, number> = {
  "one-sample-mean": 20,
  "two-means": 20,
  "paired-means": 20,
  "one-proportion": Math.PI,
  "two-proportions": Math.PI,
  correlation: 20,
  anova: 20,
};

export type EffectOutcome = { ok: true; effect: number } | { ok: false; reason: "not-reachable" };

/**
 * The smallest effect, as a positive magnitude in the design's metric, that reaches
 * the target power with sample size n. Found by bisection, then rounded up to four
 * decimal places so the reported effect still reaches the target.
 */
export function minimumDetectableEffect(parameters: Omit<PowerParameters, "effect">, n: number, targetPower: number): EffectOutcome {
  const ceiling = EFFECT_CEILING[parameters.design];
  const powerAt = (effect: number) => powerFor({ ...parameters, effect }, n);
  if (powerAt(ceiling) < targetPower) return { ok: false, reason: "not-reachable" };
  const found = bisect(powerAt, targetPower, 1e-9, ceiling, 1e-12);
  if (found === null) return { ok: false, reason: "not-reachable" };
  let effect = Math.ceil(found * 1e4 - 1e-9) / 1e4;
  while (powerAt(effect) < targetPower) effect += 1e-4;
  return { ok: true, effect: Math.round(effect * 1e4) / 1e4 };
}
