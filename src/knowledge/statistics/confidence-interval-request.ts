/**
 * A confidence interval as a researcher enters it: text from a form, checked field
 * by field, then calculated. Every rejection says what is wrong and how to fix it,
 * and a result is returned only when every number in it is finite and the interval
 * contains its estimate.
 */

import { correlationInterval, meanInterval, newcombeInterval, welchInterval, wilsonInterval, type CiMethod, type ConfidenceInterval } from "./confidence-interval";
import { decimal, probability, wholeNumber, type Parsed } from "./parse";

export type CiFieldId =
  | "confidence"
  | "mean"
  | "sd"
  | "n"
  | "mean1"
  | "sd1"
  | "n1"
  | "mean2"
  | "sd2"
  | "n2"
  | "meanDifference"
  | "sdDifference"
  | "pairs"
  | "successes"
  | "successes1"
  | "successes2"
  | "r";

/** The fields each method asks for, in the order a form shows them. The confidence level is common to all. */
export const CI_FIELDS: Record<CiMethod, readonly CiFieldId[]> = {
  "one-mean": ["mean", "sd", "n"],
  "two-means": ["mean1", "sd1", "n1", "mean2", "sd2", "n2"],
  "paired-mean": ["meanDifference", "sdDifference", "pairs"],
  "one-proportion": ["successes", "n"],
  "two-proportions": ["successes1", "n1", "successes2", "n2"],
  correlation: ["r", "n"],
};

export interface CiFieldError {
  field: CiFieldId;
  message: string;
}

export interface CiRequest {
  method: CiMethod;
  values: Partial<Record<CiFieldId, string>>;
}

/** The largest sample size accepted, far beyond any study the calculator is for. */
export const MAX_CI_SAMPLE = 10_000_000;
/** Means and standard deviations beyond this size lose the precision the calculation needs. */
const MAX_MAGNITUDE = 1e15;

export type CiCalculation =
  | { ok: false; errors: CiFieldError[]; failure?: undefined }
  /** The values passed validation, but the calculation couldn't produce a reliable interval from them. */
  | { ok: false; errors: []; failure: "unstable" }
  | {
      ok: true;
      method: CiMethod;
      interval: ConfidenceInterval;
      /** Decimal places for means, from those entered (at least 2); null for proportions and correlations. */
      decimals: number | null;
      /** The interval for a difference or correlation contains 0. */
      includesZero: boolean;
    };

/** The decimal places a number was entered with, such as 2 for "72.40". */
const decimalPlaces = (text: string | undefined) => {
  const match = /\.(\d*)$/u.exec((text ?? "").trim());
  return match ? match[1].length : 0;
};

/** Text copied from documents often uses the minus sign (−) rather than a hyphen-minus. */
const withHyphenMinus = (text: string | undefined) => text?.replace(/^(\s*)\u2212/u, "$1-");

function boundedDecimal(text: string | undefined, label: string, example: string): Parsed {
  const parsed = decimal(withHyphenMinus(text), label, example);
  if (!parsed.ok) return parsed;
  return Math.abs(parsed.value) <= MAX_MAGNITUDE ? parsed : { ok: false, message: `Enter ${label} between −10¹⁵ and 10¹⁵.` };
}

function standardDeviation(text: string | undefined, label: string): Parsed {
  const parsed = boundedDecimal(text, label, "9.75");
  if (!parsed.ok) return parsed;
  return parsed.value >= 0 ? parsed : { ok: false, message: `The ${label} can't be negative: a standard deviation is 0 or more.` };
}

const ZERO_SD = "With a standard deviation of 0, every value is the same, so there is no variation to estimate uncertainty from and the interval would have no width. Check the standard deviation; if it really is 0, report the mean without an interval.";

/** Checks a request and, if it is valid, calculates it. */
export function calculateConfidenceInterval(request: CiRequest): CiCalculation {
  const { method, values } = request;
  const errors: CiFieldError[] = [];
  const read = (field: CiFieldId, parsed: Parsed): number | null => {
    if (parsed.ok) return parsed.value;
    errors.push({ field, message: parsed.message });
    return null;
  };

  const confidence = read("confidence", probability(values.confidence, "the confidence level", "0.95", false));

  let interval: (() => ConfidenceInterval) | null = null;
  let decimals: number | null = null;
  /** Whether 0 is a meaningful value to compare the interval with: no difference, or no correlation. */
  let comparesWithZero = false;

  if (method === "one-mean" || method === "paired-mean") {
    const [meanField, sdField, nField] = method === "one-mean" ? (["mean", "sd", "n"] as const) : (["meanDifference", "sdDifference", "pairs"] as const);
    const mean = read(meanField, boundedDecimal(values[meanField], method === "one-mean" ? "the sample mean" : "the mean difference", method === "one-mean" ? "72.4" : "2.4"));
    const sd = read(sdField, standardDeviation(values[sdField], method === "one-mean" ? "standard deviation" : "standard deviation of the differences"));
    const n = read(nField, wholeNumber(values[nField], method === "one-mean" ? "a sample size" : "a number of pairs", 2, MAX_CI_SAMPLE));
    if (sd === 0) errors.push({ field: sdField, message: ZERO_SD });
    decimals = Math.min(8, Math.max(2, decimalPlaces(values[meanField]), decimalPlaces(values[sdField])));
    comparesWithZero = method === "paired-mean";
    if (mean !== null && sd !== null && n !== null) interval = () => meanInterval(mean, sd, n, confidence as number);
  }

  if (method === "two-means") {
    const groups = ([1, 2] as const).map((group) => ({
      mean: read(`mean${group}`, boundedDecimal(values[`mean${group}`], `the mean of group ${group}`, group === 1 ? "5.9" : "4.0")),
      sd: read(`sd${group}`, standardDeviation(values[`sd${group}`], `standard deviation of group ${group}`)),
      n: read(`n${group}`, wholeNumber(values[`n${group}`], `a sample size for group ${group}`, 2, MAX_CI_SAMPLE)),
    }));
    if (groups[0].sd === 0 && groups[1].sd === 0) errors.push({ field: "sd1", message: "Both standard deviations are 0, so every value in each group is the same and there is no variation to estimate uncertainty from. Check the standard deviations." });
    decimals = Math.min(8, Math.max(2, ...(["mean1", "sd1", "mean2", "sd2"] as const).map((field) => decimalPlaces(values[field]))));
    comparesWithZero = true;
    const [first, second] = groups;
    if (groups.every((group) => group.mean !== null && group.sd !== null && group.n !== null)) {
      interval = () => welchInterval(first as { mean: number; sd: number; n: number }, second as { mean: number; sd: number; n: number }, confidence as number);
    }
  }

  if (method === "one-proportion") {
    const n = read("n", wholeNumber(values.n, "a sample size", 1, MAX_CI_SAMPLE));
    const successes = read("successes", successCount(values.successes, "the number of successes", n));
    if (successes !== null && n !== null) interval = () => wilsonInterval(successes, n, confidence as number);
  }

  if (method === "two-proportions") {
    const n1 = read("n1", wholeNumber(values.n1, "a sample size for group 1", 1, MAX_CI_SAMPLE));
    const successes1 = read("successes1", successCount(values.successes1, "the number of successes in group 1", n1));
    const n2 = read("n2", wholeNumber(values.n2, "a sample size for group 2", 1, MAX_CI_SAMPLE));
    const successes2 = read("successes2", successCount(values.successes2, "the number of successes in group 2", n2));
    comparesWithZero = true;
    if (successes1 !== null && n1 !== null && successes2 !== null && n2 !== null) interval = () => newcombeInterval(successes1, n1, successes2, n2, confidence as number);
  }

  if (method === "correlation") {
    const r = read("r", correlation(values.r));
    const n = read("n", wholeNumber(values.n, "a sample size", 4, MAX_CI_SAMPLE));
    comparesWithZero = true;
    if (r !== null && n !== null) interval = () => correlationInterval(r, n, confidence as number);
  }

  if (errors.length > 0 || confidence === null || interval === null) return { ok: false, errors };
  const result = interval();
  if (!reliable(result)) return { ok: false, errors: [], failure: "unstable" };
  return { ok: true, method, interval: result, decimals, includesZero: comparesWithZero && result.lower <= 0 && result.upper >= 0 };
}

/** A count of successes: a whole number from 0 to the sample size. */
function successCount(text: string | undefined, label: string, n: number | null): Parsed {
  const parsed = wholeNumber(text, label, 0, MAX_CI_SAMPLE);
  if (!parsed.ok) return parsed;
  if (n !== null && parsed.value > n) return { ok: false, message: `The number of successes (${parsed.value.toLocaleString("en")}) can't be more than the sample size (${n.toLocaleString("en")}).` };
  return parsed;
}

function correlation(text: string | undefined): Parsed {
  const parsed = decimal(withHyphenMinus(text), "the correlation r", "0.45");
  if (!parsed.ok) return parsed;
  if (Math.abs(parsed.value) > 1) return { ok: false, message: "Enter a correlation between -1 and 1, such as 0.45." };
  if (Math.abs(parsed.value) === 1) {
    return { ok: false, message: "A correlation of exactly 1 or -1 is a perfect straight line with no sampling variation, and Fisher's z transformation is infinite there, so no interval can be calculated. Check the value." };
  }
  return parsed;
}

/** Whether an interval is safe to show: every number finite, and lower ≤ estimate ≤ upper. */
function reliable(interval: ConfidenceInterval): boolean {
  const numbers = Object.values(interval).filter((value): value is number => typeof value === "number");
  if (interval.critical.distribution === "t") numbers.push(interval.critical.df);
  numbers.push(interval.critical.value);
  if (!numbers.every(Number.isFinite)) return false;
  // Underflow in extreme inputs could break the Welch degrees of freedom, which are never below 1 here.
  if (interval.critical.distribution === "t" && interval.critical.df < 1) return false;
  return interval.lower <= interval.estimate && interval.estimate <= interval.upper && interval.lower < interval.upper;
}
