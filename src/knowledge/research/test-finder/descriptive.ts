/**
 * Descriptive statistics for teaching: the median and mode alongside the shared mean and
 * standard deviation, and a small example that shows how they differ. The example is
 * invented; every figure shown is calculated from it.
 */

import { mean, standardDeviation } from "../../tables/stats";

/** The middle value, or the mean of the two middle values for an even count. */
export function median(values: readonly number[]): number {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** The most common values, in first-seen order; every value when none repeats. */
export function modes<T extends string | number>(values: readonly T[]): T[] {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const highest = Math.max(0, ...counts.values());
  return [...counts.keys()].filter((value) => counts.get(value) === highest);
}

/** Days of training attended by nine employees in a year (invented for illustration). */
export const TRAINING_DAYS = [2, 3, 3, 3, 4, 5, 5, 6, 14] as const;

/** Department of twenty employees (invented for illustration). */
export const DEPARTMENTS = [
  ...Array<string>(8).fill("Finance"),
  ...Array<string>(5).fill("Human resources"),
  ...Array<string>(7).fill("Marketing"),
] as const;

export interface DescriptiveSummary {
  label: string;
  value: string;
  working: string;
  meaning: string;
}

const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);
const one = (value: number) => value.toFixed(1);

/** Mean, median, mode and standard deviation of the training-days example, with the working. */
export function trainingSummary(): DescriptiveSummary[] {
  const values = [...TRAINING_DAYS];
  return [
    { label: "Mean", value: one(mean(values)), working: `(${values.join(" + ")}) ÷ ${values.length} = ${sum(values)} ÷ ${values.length}`, meaning: "The average, pulled upwards by the one employee with 14 days." },
    { label: "Median", value: one(median(values)), working: `The 5th of the 9 values in order`, meaning: "The middle employee attended 4 days: half attended fewer or the same, half the same or more." },
    { label: "Mode", value: modes(values).join(", "), working: "3 appears three times, more than any other value", meaning: "The most common number of days." },
    { label: "Standard deviation", value: standardDeviation(values).toFixed(2), working: "√[ Σ(x − x̄)² ÷ (n − 1) ]", meaning: "Values typically lie a few days from the mean; the one large value inflates it." },
  ];
}
