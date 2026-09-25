/**
 * Checks entered results before they are interpreted: required values present, each in
 * its possible range, and combinations that can't all be true. Every problem names the
 * field and says how to fix it.
 */

import { SIGNIFICANCE_LEVELS, getFields, type ResultInput } from "./types";

export interface ResultProblem {
  /** The field the problem concerns, or null for the whole result. */
  field: string | null;
  message: string;
}

const format = (value: number) => String(value);

/** Problems that stop a result being interpreted. Empty when it can be. Throws a RangeError for an unknown kind or significance level. */
export function resultProblems(input: ResultInput): ResultProblem[] {
  const fields = getFields(input.kind);
  if (!SIGNIFICANCE_LEVELS.includes(input.alpha)) throw new RangeError(`Unsupported significance level: ${input.alpha}`);
  const problems: ResultProblem[] = [];
  const values = input.values;

  for (const field of fields) {
    const value = values[field.key];
    if (value === undefined) {
      if (field.required) problems.push({ field: field.key, message: `Enter the ${field.label.toLowerCase()}.` });
      continue;
    }
    if (!Number.isFinite(value)) problems.push({ field: field.key, message: `The ${field.label.toLowerCase()} must be a number.` });
    else if (field.integer && !Number.isInteger(value)) problems.push({ field: field.key, message: `The ${field.label.toLowerCase()} must be a whole number.` });
    else if (field.min !== undefined && (field.minExclusive ? value <= field.min : value < field.min)) {
      problems.push({ field: field.key, message: `The ${field.label.toLowerCase()} must be ${field.minExclusive ? "more than" : "at least"} ${format(field.min)}.` });
    } else if (field.max !== undefined && value > field.max) problems.push({ field: field.key, message: `The ${field.label.toLowerCase()} can't be more than ${format(field.max)}.` });
  }
  const known = new Set(fields.map((field) => field.key));
  for (const key of Object.keys(values)) if (!known.has(key)) problems.push({ field: key, message: `“${key}” isn't reported for this analysis.` });
  if (problems.length > 0) return problems;

  // Combinations that can't all be true.
  const has = (key: string) => values[key] !== undefined;
  const v = (key: string) => values[key];
  if (has("count") && has("total") && v("count") > v("total")) problems.push({ field: "count", message: "The count can't be more than the total." });
  if (has("scaleMin") && has("scaleMax") && v("scaleMin") >= v("scaleMax")) problems.push({ field: "scaleMax", message: "The highest possible score must be above the lowest." });
  for (const key of ["mean", "median"]) {
    if (has(key) && has("scaleMin") && has("scaleMax") && v("scaleMin") < v("scaleMax") && (v(key) < v("scaleMin") || v(key) > v("scaleMax"))) problems.push({ field: key, message: `The ${key} must lie between the lowest and highest possible scores.` });
  }
  if (has("min") && has("max") && v("min") > v("max")) problems.push({ field: "max", message: "The highest value observed can't be below the lowest." });
  for (const key of ["mean", "median"]) {
    if (has(key) && has("min") && has("max") && v("min") <= v("max") && (v(key) < v("min") || v(key) > v("max"))) problems.push({ field: key, message: `The ${key} must lie between the lowest and highest values observed.` });
  }
  if (has("adjustedR2") && v("adjustedR2") > v("r2")) problems.push({ field: "adjustedR2", message: "Adjusted R² can't be more than R²." });
  if (input.kind === "hierarchical-regression" && has("r2") && v("r2Change") > v("r2")) problems.push({ field: "r2Change", message: "The change in R² can't be more than the final R²." });
  if (has("ciLower") !== has("ciUpper")) problems.push({ field: has("ciLower") ? "ciUpper" : "ciLower", message: "Enter both confidence limits, or neither." });
  else if (has("ciLower") && !(v("ciLower") <= v("oddsRatio") && v("oddsRatio") <= v("ciUpper"))) problems.push({ field: "oddsRatio", message: "The odds ratio must lie between its confidence limits." });
  return problems;
}
