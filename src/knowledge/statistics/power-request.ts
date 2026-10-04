/**
 * A power analysis as a researcher enters it: text from a form, checked field by
 * field, then calculated. Every rejection says what is wrong and how to fix it; no
 * NaN, Infinity or impossible probability reaches the calculation.
 */

import { DESIGN_INFO, MAX_GROUPS, cohensH, fisherZ, minimumDetectableEffect, powerFor, requiredSampleSize, type Design, type Mode, type PowerParameters, type Tails } from "./power";

export type FieldId = "alpha" | "power" | "effect" | "p0" | "p1" | "p2" | "r" | "r0" | "groups" | "n";

export interface FieldError {
  field: FieldId;
  message: string;
}

export interface PowerRequest {
  design: Design;
  mode: Mode;
  tails: Tails;
  values: Partial<Record<FieldId, string>>;
}

/** The effect a calculation used, in the design's own metric. */
export type EffectSpec =
  | { metric: "d" | "dz" | "f"; value: number }
  | { metric: "h"; value: number; proportions: [number, number] }
  | { metric: "r"; value: number; nullValue: number; zDifference: number };

export interface SampleSizeResult {
  kind: "sample-size";
  /** In the design's unit: in total, pairs, or per group. */
  n: number;
  total: number;
  perGroup: number | null;
  /** Power at that sample size, at least the target. */
  achievedPower: number;
  /** The required sample size at other common targets, for comparison. */
  sensitivity: { power: number; n: number; total: number }[];
}

export interface PowerResult {
  kind: "power";
  power: number;
  n: number;
  total: number;
}

export interface EffectResult {
  kind: "effect";
  /** The smallest effect, in the design's metric, rounded up to four decimal places. */
  effect: number;
  /** For proportions, the expected proportion that effect corresponds to; for correlations, the correlation. */
  equivalent: number | null;
}

export type PowerCalculation =
  | { ok: false; errors: FieldError[]; failure?: undefined }
  | { ok: false; errors: []; failure: "too-large" | "not-reachable" }
  | {
      ok: true;
      design: Design;
      mode: Mode;
      tails: Tails;
      alpha: number;
      targetPower: number | null;
      groups: number;
      effect: EffectSpec | null;
      result: SampleSizeResult | PowerResult | EffectResult;
      /** Cautions about the method for these values. */
      warnings: ("normal-approximation" | "observed-power")[];
    };

/** Common target powers shown beside a sample size, for comparison. */
export const SENSITIVITY_POWERS = [0.8, 0.9, 0.95] as const;

const DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/u;
const WHOLE = /^\d+$/u;

type Parsed = { ok: true; value: number } | { ok: false; message: string };

function decimal(text: string | undefined, label: string, example: string): Parsed {
  const value = (text ?? "").trim();
  if (value === "") return { ok: false, message: `Enter ${label}, such as ${example}.` };
  if (value.endsWith("%")) return { ok: false, message: `Enter ${label} as a decimal, not a percentage: ${example} rather than ${Number(example) * 100}%.` };
  if (!DECIMAL.test(value)) return { ok: false, message: `Enter ${label} as a number, such as ${example}.` };
  return { ok: true, value: Number(value) };
}

function probability(text: string | undefined, label: string, example: string, inclusive: boolean): Parsed {
  const parsed = decimal(text, label, example);
  if (!parsed.ok) return parsed;
  const inside = inclusive ? parsed.value >= 0 && parsed.value <= 1 : parsed.value > 0 && parsed.value < 1;
  if (inside) return parsed;
  const range = inclusive ? "from 0 to 1" : "between 0 and 1";
  // A value above 1 and up to 100 is most likely a percentage, such as 80 for 0.80.
  if (parsed.value > 1 && parsed.value <= 100) return { ok: false, message: `Enter ${label} as a decimal ${range}, not a percentage: ${Number((parsed.value / 100).toPrecision(12))} rather than ${parsed.value}.` };
  return { ok: false, message: `Enter ${label} ${range}, such as ${example}.` };
}

function wholeNumber(text: string | undefined, label: string, minimum: number, maximum: number): Parsed {
  const value = (text ?? "").trim();
  if (value === "") return { ok: false, message: `Enter ${label}.` };
  if (!WHOLE.test(value)) return { ok: false, message: `Enter ${label} as a whole number${DECIMAL.test(value) && Number(value) > 0 ? "" : ` of at least ${minimum}`}.` };
  const number = Number(value);
  if (number < minimum) return { ok: false, message: `Enter ${label} of at least ${minimum}.` };
  if (number > maximum) return { ok: false, message: `Enter ${label} of no more than ${maximum.toLocaleString("en")}.` };
  return { ok: true, value: number };
}

const SAMPLE_LABEL = { total: "a sample size", pairs: "a number of pairs", "per-group": "a sample size per group" } as const;

/** The effect for a design, from its fields, or the errors in them. */
function readEffect(design: Design, values: PowerRequest["values"], needed: boolean, errors: FieldError[]): EffectSpec | null {
  const info = DESIGN_INFO[design];
  if (info.effectInput === "proportions") {
    const [firstField, secondField] = design === "one-proportion" ? (["p0", "p1"] as const) : (["p1", "p2"] as const);
    const first = probability(values[firstField], design === "one-proportion" ? "the proportion under the null hypothesis" : "the proportion in group 1", "0.50", true);
    if (!first.ok) errors.push({ field: firstField, message: first.message });
    if (!needed) return first.ok ? { metric: "h", value: 0, proportions: [first.value, first.value] } : null;
    const second = probability(values[secondField], design === "one-proportion" ? "the expected proportion" : "the proportion in group 2", "0.65", true);
    if (!second.ok) errors.push({ field: secondField, message: second.message });
    if (!first.ok || !second.ok) return null;
    if (first.value === second.value) {
      errors.push({ field: secondField, message: "The two proportions are equal, so there is no effect to detect. Enter the proportion you expect if the effect exists." });
      return null;
    }
    return { metric: "h", value: Math.abs(cohensH(second.value, first.value)), proportions: [first.value, second.value] };
  }
  if (info.effectInput === "correlation") {
    const nullValue = decimal(values.r0 ?? "0", "the correlation under the null hypothesis", "0");
    let rho0 = 0;
    if (!nullValue.ok) errors.push({ field: "r0", message: nullValue.message });
    else if (!(nullValue.value > -1 && nullValue.value < 1)) errors.push({ field: "r0", message: "Enter a null correlation greater than −1 and less than 1, usually 0." });
    else rho0 = nullValue.value;
    if (!needed) return { metric: "r", value: 0, nullValue: rho0, zDifference: 0 };
    const correlation = decimal(values.r, "the expected correlation", "0.30");
    if (!correlation.ok) {
      errors.push({ field: "r", message: correlation.message });
      return null;
    }
    if (!(correlation.value > -1 && correlation.value < 1)) {
      errors.push({ field: "r", message: Math.abs(correlation.value) === 1 ? "A correlation of exactly −1 or 1 can't be used: there would be no variation to sample, and Fisher's z is infinite. Enter a value between −1 and 1." : "Enter a correlation between −1 and 1, such as 0.30." });
      return null;
    }
    if (correlation.value === rho0) {
      errors.push({ field: "r", message: "The expected correlation equals the null value, so there is no effect to detect." });
      return null;
    }
    return { metric: "r", value: correlation.value, nullValue: rho0, zDifference: Math.abs(fisherZ(correlation.value) - fisherZ(rho0)) };
  }
  if (!needed) return null;
  const metric = design === "paired-means" ? "dz" : design === "anova" ? "f" : "d";
  const effect = decimal(values.effect, `the effect size ${metric}`, metric === "f" ? "0.25" : "0.5");
  if (!effect.ok) {
    errors.push({ field: "effect", message: effect.message });
    return null;
  }
  if (!(effect.value > 0)) {
    errors.push({ field: "effect", message: `Enter ${metric} as a positive number, such as ${metric === "f" ? "0.25" : "0.5"}. The direction of a one-sided test is the direction of the effect.` });
    return null;
  }
  if (effect.value > 10) {
    errors.push({ field: "effect", message: `Enter ${metric} of 10 or less. Effects this large are rarely realistic; check the value.` });
    return null;
  }
  return { metric, value: effect.value };
}

/** The proportion an arcsine effect h corresponds to above a baseline, or null if it is beyond 1. */
function proportionFromH(baseline: number, h: number): number | null {
  const angle = Math.asin(Math.sqrt(baseline)) + h / 2;
  return angle > Math.PI / 2 ? null : Math.sin(angle) ** 2;
}

/** Checks a request and, if it is valid, calculates it. */
export function calculatePower(request: PowerRequest): PowerCalculation {
  const { design, mode, values } = request;
  const info = DESIGN_INFO[design];
  const tails: Tails = info.directional ? request.tails : "two-sided";
  const errors: FieldError[] = [];

  const alpha = probability(values.alpha, "α", "0.05", false);
  if (!alpha.ok) errors.push({ field: "alpha", message: alpha.message });
  let targetPower: number | null = null;
  if (mode !== "power") {
    const power = probability(values.power, "the target power", "0.80", false);
    if (!power.ok) errors.push({ field: "power", message: power.message });
    else if (alpha.ok && power.value <= alpha.value) errors.push({ field: "power", message: "Enter a target power greater than α: even with no effect, a test rejects the null hypothesis that often." });
    else targetPower = power.value;
  }
  let groups = 2;
  if (info.hasGroups) {
    const parsed = wholeNumber(values.groups, "the number of groups", 2, MAX_GROUPS);
    if (!parsed.ok) errors.push({ field: "groups", message: parsed.message });
    else groups = parsed.value;
  }
  let n: number | null = null;
  if (mode !== "sample-size") {
    const parsed = wholeNumber(values.n, SAMPLE_LABEL[info.sampleUnit], info.minimumSample, 10_000_000);
    if (!parsed.ok) errors.push({ field: "n", message: parsed.message });
    else n = parsed.value;
  }
  const effect = readEffect(design, values, mode !== "effect", errors);
  if (errors.length > 0 || !alpha.ok) return { ok: false, errors };

  const effectMagnitude = effect === null ? 0 : effect.metric === "r" ? effect.zDifference : effect.value;
  const parameters: PowerParameters = { design, alpha: alpha.value, tails, effect: effectMagnitude, groups };
  const totalFor = (count: number) => (info.sampleUnit === "per-group" ? count * (info.hasGroups ? groups : 2) : count);
  const warnings: ("normal-approximation" | "observed-power")[] = [];
  const common = { ok: true as const, design, mode, tails, alpha: alpha.value, targetPower, groups };

  if (mode === "sample-size") {
    const outcome = requiredSampleSize(parameters, targetPower as number);
    if (!outcome.ok) return { ok: false, errors: [], failure: "too-large" };
    const sensitivity = SENSITIVITY_POWERS.map((power) => {
      const at = requiredSampleSize(parameters, power);
      return at.ok ? { power, n: at.n, total: totalFor(at.n) } : null;
    }).filter((row): row is { power: (typeof SENSITIVITY_POWERS)[number]; n: number; total: number } => row !== null);
    if (effect?.metric === "h" && smallExpectedCounts(effect.proportions, outcome.n)) warnings.push("normal-approximation");
    return { ...common, effect, warnings, result: { kind: "sample-size", n: outcome.n, total: totalFor(outcome.n), perGroup: info.sampleUnit === "per-group" ? outcome.n : null, achievedPower: outcome.power, sensitivity } };
  }

  if (mode === "power") {
    if (effect?.metric === "h" && smallExpectedCounts(effect.proportions, n as number)) warnings.push("normal-approximation");
    warnings.push("observed-power");
    return { ...common, effect, warnings, result: { kind: "power", power: powerFor(parameters, n as number), n: n as number, total: totalFor(n as number) } };
  }

  const outcome = minimumDetectableEffect({ design, alpha: alpha.value, tails, groups }, n as number, targetPower as number);
  if (!outcome.ok) return { ok: false, errors: [], failure: "not-reachable" };
  let equivalent: number | null = null;
  if (effect?.metric === "h") equivalent = proportionFromH(effect.proportions[0], outcome.effect);
  if (effect?.metric === "r") equivalent = Math.tanh(fisherZ(effect.nullValue) + outcome.effect);
  if (effect?.metric === "h" && equivalent !== null && smallExpectedCounts([effect.proportions[0], equivalent], n as number)) warnings.push("normal-approximation");
  return { ...common, effect, warnings, result: { kind: "effect", effect: outcome.effect, equivalent } };
}

/**
 * Whether a proportion's expected count of successes or failures is under 10 in a
 * sample of n, a commonly used rule of thumb below which normal approximations to
 * the binomial become unreliable.
 */
function smallExpectedCounts(proportions: readonly number[], n: number): boolean {
  return proportions.some((p) => n * Math.min(p, 1 - p) < 10);
}
