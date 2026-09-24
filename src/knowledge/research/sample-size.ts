/**
 * The sample size plan stored in the project draft, and the calculation it
 * describes. Every step records its formula, the numbers substituted, intermediate
 * values, the unrounded and rounded results, and an explanation.
 *
 * Each step starts from the previous step's rounded result, so every number in the
 * working can be checked by hand. The one exception is the finite population
 * correction, which uses the unrounded n₀, as the formula is defined.
 */

import { cochran, finitePopulationCorrection, krejcieMorgan, roundDown, roundNearest, roundUp, yamane, zScore } from "./sample-size-formulas";
import {
  CONFIDENCE_LEVELS,
  DEFAULT_INPUTS,
  SAMPLE_SIZE_METHOD_IDS,
  getSampleSizeMethod,
  type SampleSizeInputs,
  type SampleSizeMethodId,
} from "./sample-size-types";

export interface SampleSizePlan {
  method: SampleSizeMethodId;
  inputs: SampleSizeInputs;
  justification: string;
  notes: string;
}

export const DEFAULT_SAMPLE_SIZE_PLAN: SampleSizePlan = { method: "cochran", inputs: DEFAULT_INPUTS, justification: "", notes: "" };

export interface CalculationStep {
  id: "method" | "correction" | "design-effect" | "non-response" | "expected-responses" | "sampling-fraction";
  label: string;
  formula: string;
  substitution: string;
  intermediate: { label: string; value: string }[];
  /** The unrounded result. */
  value: number;
  /** The result as used from here on. */
  rounded: number;
  explanation: string;
}

export interface SampleSizeResult {
  method: SampleSizeMethodId;
  /** False for methods the calculator can't compute yet. */
  available: boolean;
  steps: CalculationStep[];
  /** The sample size the method gives, rounded. */
  required: number | null;
  /** After the design effect. */
  adjusted: number | null;
  /** How many to invite, after the response rate; null when no rate is given. */
  invite: number | null;
  /** Completed responses expected from those invited. */
  expectedResponses: number | null;
  /** The adjusted sample as a percentage of the population, when the population is known. */
  samplingFraction: number | null;
  /** Whether the adjusted sample or the invitations exceed the population. */
  exceedsPopulation: boolean;
}

/** A number for display: up to `decimals` places, without trailing zeros. */
export function formatNumber(value: number, decimals = 4): string {
  if (!Number.isFinite(value)) return String(value);
  const fixed = value.toFixed(decimals);
  return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
}

/** Throws a RangeError describing the first input that makes calculation impossible. */
export function assertCalculable(plan: SampleSizePlan): void {
  const { inputs } = plan;
  const method = getSampleSizeMethod(plan.method);
  if (!CONFIDENCE_LEVELS.some((entry) => entry.level === inputs.confidence)) throw new RangeError(`Unsupported confidence level: ${inputs.confidence}`);
  if (!(inputs.margin > 0 && inputs.margin < 50)) throw new RangeError("The margin of error must be more than 0% and less than 50%.");
  if (!(inputs.proportion > 0 && inputs.proportion < 100)) throw new RangeError("The estimated proportion must be more than 0% and less than 100%.");
  if (inputs.responseRate !== null && !(inputs.responseRate > 0 && inputs.responseRate <= 100)) throw new RangeError("The response rate must be more than 0% and no more than 100%.");
  if (!(inputs.designEffect > 0 && Number.isFinite(inputs.designEffect))) throw new RangeError("The design effect must be a positive number.");
  if (inputs.populationType === "finite") {
    if (inputs.populationSize === null || !Number.isInteger(inputs.populationSize) || inputs.populationSize < 1) {
      throw new RangeError("The population size must be a whole number of at least 1.");
    }
  }
  if (method.needsPopulation && inputs.populationType !== "finite") throw new RangeError(`${method.name} needs a known population size.`);
}

/** Calculates the sample size, step by step. Throws a RangeError for inputs that can't be calculated. */
export function calculateSampleSize(plan: SampleSizePlan): SampleSizeResult {
  assertCalculable(plan);
  const { inputs } = plan;
  const method = getSampleSizeMethod(plan.method);
  const empty: SampleSizeResult = { method: plan.method, available: false, steps: [], required: null, adjusted: null, invite: null, expectedResponses: null, samplingFraction: null, exceedsPopulation: false };
  if (!method.available) return empty;

  const z = zScore(inputs.confidence);
  const p = inputs.proportion / 100;
  const e = inputs.margin / 100;
  const N = inputs.populationType === "finite" ? inputs.populationSize! : null;
  const steps: CalculationStep[] = [];
  const f = formatNumber;

  const cochranStep = (): CalculationStep => {
    const n0 = cochran(z, p, e);
    return {
      id: "method",
      label: "Cochran's formula",
      formula: "n₀ = z² × p × (1 − p) ÷ e²",
      substitution: `n₀ = ${f(z, 6)}² × ${f(p)} × (1 − ${f(p)}) ÷ ${f(e)}²`,
      intermediate: [
        { label: `z for ${inputs.confidence}% confidence`, value: f(z, 6) },
        { label: "z²", value: f(z * z, 6) },
        { label: "p × (1 − p)", value: f(p * (1 - p)) },
        { label: "e²", value: f(e * e, 6) },
      ],
      value: n0,
      rounded: roundUp(n0),
      explanation: `With ${inputs.confidence}% confidence, a ±${f(inputs.margin, 2)}% margin of error and an estimated proportion of ${f(inputs.proportion, 2)}%, a very large population needs ${roundUp(n0)} participants (${f(n0)} rounded up).`,
    };
  };

  switch (plan.method) {
    case "cochran":
    case "unknown-population":
      steps.push(cochranStep());
      break;
    case "finite-population-correction": {
      const first = cochranStep();
      const n0 = first.value;
      const n = finitePopulationCorrection(n0, N!);
      steps.push(first, {
        id: "correction",
        label: "Finite population correction",
        formula: "n = n₀ ÷ (1 + (n₀ − 1) ÷ N)",
        substitution: `n = ${f(n0)} ÷ (1 + (${f(n0)} − 1) ÷ ${N})`,
        intermediate: [
          { label: "(n₀ − 1) ÷ N", value: f((n0 - 1) / N!, 6) },
          { label: "Denominator", value: f(1 + (n0 - 1) / N!, 6) },
        ],
        value: n,
        rounded: roundUp(n),
        explanation: `Because the population has ${N} members, the sample can be smaller: ${roundUp(n)} (${f(n)} rounded up). The correction uses the unrounded n₀.`,
      });
      break;
    }
    case "yamane":
    case "slovin": {
      const n = yamane(N!, e);
      steps.push({
        id: "method",
        label: `${method.name.replace(" formula", "")}'s formula`,
        formula: "n = N ÷ (1 + N × e²)",
        substitution: `n = ${N} ÷ (1 + ${N} × ${f(e)}²)`,
        intermediate: [
          { label: "N × e²", value: f(N! * e * e, 6) },
          { label: "Denominator", value: f(1 + N! * e * e, 6) },
        ],
        value: n,
        rounded: roundUp(n),
        explanation: `For a population of ${N} and a ±${f(inputs.margin, 2)}% margin of error, the formula gives ${roundUp(n)} (${f(n)} rounded up). It assumes 95% confidence and a 50% proportion, whatever values are entered.`,
      });
      break;
    }
    case "krejcie-morgan": {
      const s = krejcieMorgan(N!, z, p, e);
      const chiSquare = z * z;
      steps.push({
        id: "method",
        label: "Krejcie and Morgan formula",
        formula: "s = X² × N × P × (1 − P) ÷ (d² × (N − 1) + X² × P × (1 − P))",
        substitution: `s = ${f(chiSquare, 6)} × ${N} × ${f(p)} × (1 − ${f(p)}) ÷ (${f(e)}² × (${N} − 1) + ${f(chiSquare, 6)} × ${f(p)} × (1 − ${f(p)}))`,
        intermediate: [
          { label: `X² for ${inputs.confidence}% confidence (z²)`, value: f(chiSquare, 6) },
          { label: "Numerator", value: f(chiSquare * N! * p * (1 - p)) },
          { label: "Denominator", value: f(e * e * (N! - 1) + chiSquare * p * (1 - p), 6) },
        ],
        value: s,
        rounded: roundNearest(s),
        explanation: `The formula gives ${f(s)}. Following the published table, it is rounded to the nearest whole number: ${roundNearest(s)}. Rounded up, it would be ${roundUp(s)}.`,
      });
      break;
    }
    case "power-analysis":
      return empty;
  }

  const required = steps[steps.length - 1].rounded;
  const adjustedValue = required * inputs.designEffect;
  const adjusted = roundUp(adjustedValue);
  steps.push({
    id: "design-effect",
    label: "Design effect",
    formula: "n_adjusted = n × design effect",
    substitution: `n_adjusted = ${required} × ${f(inputs.designEffect)}`,
    intermediate: [],
    value: adjustedValue,
    rounded: adjusted,
    explanation:
      inputs.designEffect === 1
        ? "A design effect of 1 assumes simple random sampling, so the sample size is unchanged."
        : `A design effect of ${f(inputs.designEffect)} allows for the sampling design, such as clustering: ${adjusted} participants.`,
  });

  let invite: number | null = null;
  let expectedResponses: number | null = null;
  if (inputs.responseRate !== null) {
    const r = inputs.responseRate / 100;
    const inviteValue = adjusted / r;
    invite = roundUp(inviteValue);
    steps.push({
      id: "non-response",
      label: "Non-response adjustment",
      formula: "invitations = n_adjusted ÷ response rate",
      substitution: `invitations = ${adjusted} ÷ ${f(r)}`,
      intermediate: [],
      value: inviteValue,
      rounded: invite,
      explanation: `If ${f(inputs.responseRate, 2)}% of people take part, about ${invite} must be invited to reach ${adjusted} participants.`,
    });
    const expectedValue = invite * r;
    expectedResponses = roundDown(expectedValue);
    steps.push({
      id: "expected-responses",
      label: "Expected responses",
      formula: "expected responses = invitations × response rate",
      substitution: `expected responses = ${invite} × ${f(r)}`,
      intermediate: [],
      value: expectedValue,
      rounded: expectedResponses,
      explanation: `Inviting ${invite} people should give about ${expectedResponses} completed responses, rounded down to whole responses.`,
    });
  }

  let samplingFraction: number | null = null;
  if (N !== null) {
    samplingFraction = (adjusted / N) * 100;
    steps.push({
      id: "sampling-fraction",
      label: "Sampling fraction",
      formula: "sampling fraction = n_adjusted ÷ N",
      substitution: `sampling fraction = ${adjusted} ÷ ${N}`,
      intermediate: [],
      value: samplingFraction,
      rounded: Math.round(samplingFraction * 10) / 10,
      explanation: `The sample is ${f(samplingFraction, 1)}% of the population.`,
    });
  }

  return {
    method: plan.method,
    available: true,
    steps,
    required,
    adjusted,
    invite,
    expectedResponses,
    samplingFraction,
    exceedsPopulation: N !== null && (adjusted > N || (invite ?? 0) > N),
  };
}

// Editing.

export function chooseMethod(plan: SampleSizePlan, method: SampleSizeMethodId): SampleSizePlan {
  getSampleSizeMethod(method);
  return { ...plan, method };
}

export const updateInputs = (plan: SampleSizePlan, changes: Partial<SampleSizeInputs>): SampleSizePlan => ({ ...plan, inputs: { ...plan.inputs, ...changes } });
export const setSampleSizeText = (plan: SampleSizePlan, field: "justification" | "notes", text: string): SampleSizePlan => ({ ...plan, [field]: text });

/**
 * Parses a number typed by the researcher, such as “1,200”, “62.5” or “70%”.
 * Returns null for empty text and a RangeError for anything that isn't a number.
 */
export function parseNumber(text: string): number | null {
  const trimmed = text.trim().replace(/%$/, "").trim().replace(/,(?=\d{3}\b)/g, "");
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) throw new RangeError("Enter a number.");
  return value;
}

/** Checks a plan's method and inputs, and cleans its text. Throws a RangeError for an unknown method or confidence level. */
export function cleanSampleSizePlan(plan: SampleSizePlan): SampleSizePlan {
  if (!(SAMPLE_SIZE_METHOD_IDS as readonly string[]).includes(plan.method)) throw new RangeError(`Unknown sample size method: ${plan.method}`);
  if (!CONFIDENCE_LEVELS.some((entry) => entry.level === plan.inputs.confidence)) throw new RangeError(`Unsupported confidence level: ${plan.inputs.confidence}`);
  if (plan.inputs.populationType !== "finite" && plan.inputs.populationType !== "unknown") throw new RangeError(`Unknown population type: ${plan.inputs.populationType}`);
  const text = (value: string) => value.replace(/[ \t]+/g, " ").trim();
  return { method: plan.method, inputs: { ...plan.inputs }, justification: text(plan.justification), notes: text(plan.notes) };
}
