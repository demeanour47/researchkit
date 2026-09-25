/** Inputs for results tests. Not part of the product. */

import type { ResultInput, ResultKind } from "./types";

/** The fewest numbers each kind of result needs, with typical values. */
export const VALID: Readonly<Record<ResultKind, Readonly<Record<string, number>>>> = {
  "descriptive-statistics": { n: 120, mean: 3.4, sd: 0.8 },
  frequency: { count: 30, total: 120 },
  percentage: { percentage: 25 },
  mean: { mean: 3.4 },
  median: { median: 3 },
  "standard-deviation": { sd: 0.8 },
  "cronbach-alpha": { alpha: 0.84 },
  correlation: { r: 0.3, p: 0.01 },
  pearson: { r: 0.3, p: 0.01 },
  spearman: { r: 0.3, p: 0.01 },
  "simple-regression": { b: 0.5, p: 0.01 },
  "multiple-regression": { r2: 0.2, p: 0.001 },
  "hierarchical-regression": { r2Change: 0.05, pChange: 0.01 },
  "logistic-regression": { oddsRatio: 1.5, p: 0.02 },
  "independent-t-test": { t: 2.1, df: 58, p: 0.04 },
  "paired-t-test": { t: 3, df: 29, p: 0.005 },
  "one-way-anova": { f: 4.5, df1: 2, df2: 117, p: 0.013 },
  "two-way-anova": { fInteraction: 5, pInteraction: 0.03 },
  "chi-square": { chi2: 6.2, df: 1, p: 0.013 },
  "factor-analysis": { kmo: 0.82, bartlettP: 0.0001 },
  sem: { cfi: 0.96, rmsea: 0.05 },
  "pls-sem": { path: 0.32, p: 0.001 },
};

export function input(kind: ResultKind, values: Readonly<Record<string, number>> = VALID[kind], extra: Partial<ResultInput> = {}): ResultInput {
  return { kind, values, variables: ["screen time", "sleep quality"], hypothesisId: null, alpha: 0.05, ...extra };
}
