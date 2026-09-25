/**
 * How large an effect is, by the conventions researchers most often cite. Conventions
 * are rules of thumb: what counts as large depends on the field. Their sources are
 * named but not yet added to the reference list; they await academic review.
 */

export interface Magnitude {
  /** A word for the size, such as “medium”. */
  label: string;
  /** The convention the label follows. */
  convention: string;
}

type Band = readonly [threshold: number, label: string];

/** The label of the highest band the value reaches; the first band's label applies below every threshold. */
function band(value: number, below: string, bands: readonly Band[]): string {
  let label = below;
  for (const [threshold, name] of bands) if (value >= threshold) label = name;
  return label;
}

const COHEN = "Cohen's conventions";

export const correlationMagnitude = (r: number): Magnitude => ({
  label: band(Math.abs(r), "negligible", [
    [0.1, "small"],
    [0.3, "medium"],
    [0.5, "large"],
  ]),
  convention: `${COHEN} for correlations: .10 small, .30 medium, .50 large`,
});

export const dMagnitude = (d: number): Magnitude => ({
  label: band(Math.abs(d), "negligible", [
    [0.2, "small"],
    [0.5, "medium"],
    [0.8, "large"],
  ]),
  convention: `${COHEN} for d: .20 small, .50 medium, .80 large`,
});

export const etaMagnitude = (eta: number): Magnitude => ({
  label: band(eta, "negligible", [
    [0.01, "small"],
    [0.06, "medium"],
    [0.14, "large"],
  ]),
  convention: `${COHEN} for eta squared: .01 small, .06 medium, .14 large`,
});

/** R² judged through Cohen's f² = R² / (1 − R²): .02 small, .15 medium, .35 large. */
export function r2Magnitude(r2: number): Magnitude {
  const f2 = r2 >= 1 ? Number.POSITIVE_INFINITY : r2 / (1 - r2);
  return {
    label: band(f2, "negligible", [
      [0.02, "small"],
      [0.15, "medium"],
      [0.35, "large"],
    ]),
    convention: `${COHEN} for f² (R² / (1 − R²)): .02 small, .15 medium, .35 large`,
  };
}

/** Cramér's V, with thresholds scaled by the table's size: Cohen's w thresholds divided by √k. */
export function cramersVMagnitude(v: number, k = 1): Magnitude {
  const root = Math.sqrt(k);
  return {
    label: band(v, "negligible", [
      [0.1 / root, "small"],
      [0.3 / root, "medium"],
      [0.5 / root, "large"],
    ]),
    convention: `${COHEN} for w, scaled for a table where the smaller of rows − 1 and columns − 1 is ${k}`,
  };
}

export const alphaMagnitude = (alpha: number): Magnitude => ({
  label: band(alpha, "unacceptable", [
    [0.5, "poor"],
    [0.6, "questionable"],
    [0.7, "acceptable"],
    [0.8, "good"],
    [0.9, "excellent"],
  ]),
  convention: "Commonly used bands: .90 excellent, .80 good, .70 acceptable, .60 questionable, .50 poor",
});

export const kmoMagnitude = (kmo: number): Magnitude => ({
  label: band(kmo, "unacceptable", [
    [0.5, "miserable"],
    [0.6, "mediocre"],
    [0.7, "middling"],
    [0.8, "meritorious"],
    [0.9, "marvellous"],
  ]),
  convention: "Kaiser's labels: .90 marvellous, .80 meritorious, .70 middling, .60 mediocre, .50 miserable",
});

export const plsR2Magnitude = (r2: number): Magnitude => ({
  label: band(r2, "very weak", [
    [0.25, "weak"],
    [0.5, "moderate"],
    [0.75, "substantial"],
  ]),
  convention: "Common PLS-SEM guidance: .75 substantial, .50 moderate, .25 weak",
});

export type FitVerdict = "good" | "acceptable" | "poor";

export interface FitIndex {
  index: string;
  value: number;
  verdict: FitVerdict;
  convention: string;
}

/** Fit indices judged by commonly cited cut-offs; they are guides, not tests. */
export function fitIndices(values: { cfi: number; rmsea: number; srmr?: number; tli?: number }): FitIndex[] {
  const indices: FitIndex[] = [
    { index: "CFI", value: values.cfi, verdict: values.cfi >= 0.95 ? "good" : values.cfi >= 0.9 ? "acceptable" : "poor", convention: ".95 or more good; .90 or more acceptable" },
    { index: "RMSEA", value: values.rmsea, verdict: values.rmsea <= 0.06 ? "good" : values.rmsea <= 0.08 ? "acceptable" : "poor", convention: ".06 or less good; .08 or less acceptable" },
  ];
  if (values.srmr !== undefined) indices.push({ index: "SRMR", value: values.srmr, verdict: values.srmr <= 0.08 ? "good" : values.srmr <= 0.1 ? "acceptable" : "poor", convention: ".08 or less good; .10 or less acceptable" });
  if (values.tli !== undefined) indices.push({ index: "TLI", value: values.tli, verdict: values.tli >= 0.95 ? "good" : values.tli >= 0.9 ? "acceptable" : "poor", convention: ".95 or more good; .90 or more acceptable" });
  return indices;
}
