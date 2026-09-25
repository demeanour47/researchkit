/**
 * The results the Results Interpretation Assistant explains, and what the researcher
 * enters for each: the numbers their statistics software already reported. Nothing is
 * calculated from raw data. Result kinds share their ids with the analysis methods, so
 * a method's name, purpose, assumptions and limitations live in one place.
 */

import type { AnalysisMethodId } from "../data-analysis-types";

export const RESULT_KINDS = [
  "descriptive-statistics",
  "frequency",
  "percentage",
  "mean",
  "median",
  "standard-deviation",
  "cronbach-alpha",
  "correlation",
  "pearson",
  "spearman",
  "simple-regression",
  "multiple-regression",
  "hierarchical-regression",
  "logistic-regression",
  "independent-t-test",
  "paired-t-test",
  "one-way-anova",
  "two-way-anova",
  "chi-square",
  "factor-analysis",
  "sem",
  "pls-sem",
] as const satisfies readonly AnalysisMethodId[];
export type ResultKind = (typeof RESULT_KINDS)[number];

/** One number the researcher enters, with the range it can take. */
export interface FieldSpec {
  key: string;
  label: string;
  /** How the statistic is written in a report, such as “r” or “p”. */
  symbol: string;
  hint: string;
  required: boolean;
  min?: number;
  max?: number;
  /** True when the value must be greater than min, not equal to it. */
  minExclusive?: boolean;
  integer?: boolean;
}

const p = (required = true, key = "p", label = "p-value"): FieldSpec => ({ key, label, symbol: "p", hint: "As reported, such as 0.032. Enter 0.001 for “< .001”.", required, min: 0, max: 1 });
const n = (min = 1): FieldSpec => ({ key: "n", label: "Sample size", symbol: "N", hint: "The number of participants in the analysis.", required: false, min, integer: true });
const scale: FieldSpec[] = [
  { key: "scaleMin", label: "Lowest possible score", symbol: "min", hint: "The scale's lowest point, such as 1 on a 1–5 scale.", required: false },
  { key: "scaleMax", label: "Highest possible score", symbol: "max", hint: "The scale's highest point, such as 5 on a 1–5 scale.", required: false },
];
const correlation = (symbol: string, label: string): FieldSpec[] => [
  { key: "r", label, symbol, hint: "Between −1 and 1.", required: true, min: -1, max: 1 },
  p(),
  n(3),
];

export const RESULT_FIELDS: Readonly<Record<ResultKind, readonly FieldSpec[]>> = {
  "descriptive-statistics": [
    { key: "n", label: "Sample size", symbol: "N", hint: "The number of participants with a value.", required: true, min: 1, integer: true },
    { key: "mean", label: "Mean", symbol: "M", hint: "The average.", required: true },
    { key: "sd", label: "Standard deviation", symbol: "SD", hint: "Zero or more.", required: true, min: 0 },
    { key: "median", label: "Median", symbol: "Mdn", hint: "Optional.", required: false },
    { key: "min", label: "Lowest value observed", symbol: "min", hint: "Optional.", required: false },
    { key: "max", label: "Highest value observed", symbol: "max", hint: "Optional.", required: false },
  ],
  frequency: [
    { key: "count", label: "Count in the category", symbol: "n", hint: "How many participants gave this answer.", required: true, min: 0, integer: true },
    { key: "total", label: "Total", symbol: "N", hint: "How many participants answered.", required: true, min: 1, integer: true },
  ],
  percentage: [
    { key: "percentage", label: "Percentage", symbol: "%", hint: "Between 0 and 100.", required: true, min: 0, max: 100 },
    { key: "total", label: "Total it is a percentage of", symbol: "N", hint: "Optional, but readers need it.", required: false, min: 1, integer: true },
  ],
  mean: [
    { key: "mean", label: "Mean", symbol: "M", hint: "The average.", required: true },
    { key: "sd", label: "Standard deviation", symbol: "SD", hint: "Optional. Zero or more.", required: false, min: 0 },
    n(),
    ...scale,
  ],
  median: [{ key: "median", label: "Median", symbol: "Mdn", hint: "The middle value.", required: true }, n(), ...scale],
  "standard-deviation": [{ key: "sd", label: "Standard deviation", symbol: "SD", hint: "Zero or more.", required: true, min: 0 }, { key: "mean", label: "Mean", symbol: "M", hint: "Optional, to judge the spread against.", required: false }, ...scale],
  "cronbach-alpha": [
    { key: "alpha", label: "Cronbach's alpha", symbol: "α", hint: "Usually between 0 and 1; a negative value is possible and meaningful.", required: true, max: 1 },
    { key: "items", label: "Number of items", symbol: "k", hint: "Optional.", required: false, min: 2, integer: true },
    n(2),
  ],
  correlation: correlation("r", "Correlation coefficient"),
  pearson: correlation("r", "Pearson's r"),
  spearman: correlation("rₛ", "Spearman's rho"),
  "simple-regression": [
    { key: "b", label: "Unstandardised coefficient", symbol: "B", hint: "The change in the outcome for each one-unit increase in the predictor.", required: true },
    { key: "beta", label: "Standardised coefficient", symbol: "β", hint: "Optional.", required: false },
    { key: "r2", label: "R squared", symbol: "R²", hint: "Optional. Between 0 and 1.", required: false, min: 0, max: 1 },
    p(),
    n(3),
  ],
  "multiple-regression": [
    { key: "r2", label: "R squared", symbol: "R²", hint: "The whole model's. Between 0 and 1.", required: true, min: 0, max: 1 },
    { key: "adjustedR2", label: "Adjusted R squared", symbol: "adj. R²", hint: "Optional. At most R².", required: false, max: 1 },
    { key: "f", label: "F statistic", symbol: "F", hint: "Optional. The model's F.", required: false, min: 0 },
    p(true, "p", "p-value for the whole model"),
    { key: "predictors", label: "Number of predictors", symbol: "k", hint: "Optional.", required: false, min: 2, integer: true },
    { key: "beta", label: "One predictor's standardised coefficient", symbol: "β", hint: "Optional: the predictor your hypothesis concerns.", required: false },
    p(false, "predictorP", "That predictor's p-value"),
    n(3),
  ],
  "hierarchical-regression": [
    { key: "r2Change", label: "Change in R squared", symbol: "ΔR²", hint: "What the final step adds. Between 0 and 1.", required: true, min: 0, max: 1 },
    p(true, "pChange", "p-value for the change"),
    { key: "fChange", label: "F for the change", symbol: "ΔF", hint: "Optional.", required: false, min: 0 },
    { key: "r2", label: "Final R squared", symbol: "R²", hint: "Optional. At least ΔR².", required: false, min: 0, max: 1 },
  ],
  "logistic-regression": [
    { key: "oddsRatio", label: "Odds ratio", symbol: "OR", hint: "Exp(B). Greater than 0.", required: true, min: 0, minExclusive: true },
    { key: "ciLower", label: "Lower 95% confidence limit", symbol: "CI lower", hint: "Optional.", required: false, min: 0, minExclusive: true },
    { key: "ciUpper", label: "Upper 95% confidence limit", symbol: "CI upper", hint: "Optional.", required: false, min: 0, minExclusive: true },
    p(),
    { key: "pseudoR2", label: "Nagelkerke R squared", symbol: "R²N", hint: "Optional.", required: false, min: 0, max: 1 },
  ],
  "independent-t-test": [
    { key: "t", label: "t statistic", symbol: "t", hint: "Positive or negative.", required: true },
    { key: "df", label: "Degrees of freedom", symbol: "df", hint: "Welch's version gives decimals.", required: true, min: 0, minExclusive: true },
    p(),
    { key: "mean1", label: "Mean of the first group", symbol: "M₁", hint: "Optional.", required: false },
    { key: "mean2", label: "Mean of the second group", symbol: "M₂", hint: "Optional.", required: false },
    { key: "d", label: "Cohen's d", symbol: "d", hint: "Optional effect size.", required: false },
  ],
  "paired-t-test": [
    { key: "t", label: "t statistic", symbol: "t", hint: "Positive or negative.", required: true },
    { key: "df", label: "Degrees of freedom", symbol: "df", hint: "The number of pairs minus one.", required: true, min: 0, minExclusive: true, integer: true },
    p(),
    { key: "mean1", label: "Mean at the first time or condition", symbol: "M₁", hint: "Optional.", required: false },
    { key: "mean2", label: "Mean at the second time or condition", symbol: "M₂", hint: "Optional.", required: false },
    { key: "d", label: "Cohen's d", symbol: "d", hint: "Optional effect size.", required: false },
  ],
  "one-way-anova": [
    { key: "f", label: "F statistic", symbol: "F", hint: "Zero or more.", required: true, min: 0 },
    { key: "df1", label: "Between-groups degrees of freedom", symbol: "df₁", hint: "The number of groups minus one.", required: true, min: 1, integer: true },
    { key: "df2", label: "Within-groups degrees of freedom", symbol: "df₂", hint: "Welch's version gives decimals.", required: true, min: 0, minExclusive: true },
    p(),
    { key: "etaSquared", label: "Eta squared", symbol: "η²", hint: "Optional effect size, between 0 and 1.", required: false, min: 0, max: 1 },
  ],
  "two-way-anova": [
    { key: "fInteraction", label: "F for the interaction", symbol: "F", hint: "Zero or more.", required: true, min: 0 },
    p(true, "pInteraction", "p-value for the interaction"),
    { key: "partialEta", label: "Partial eta squared for the interaction", symbol: "ηp²", hint: "Optional, between 0 and 1.", required: false, min: 0, max: 1 },
    { key: "fA", label: "F for the first factor", symbol: "F", hint: "Optional.", required: false, min: 0 },
    p(false, "pA", "p-value for the first factor"),
    { key: "fB", label: "F for the second factor", symbol: "F", hint: "Optional.", required: false, min: 0 },
    p(false, "pB", "p-value for the second factor"),
  ],
  "chi-square": [
    { key: "chi2", label: "Chi-square statistic", symbol: "χ²", hint: "Zero or more.", required: true, min: 0 },
    { key: "df", label: "Degrees of freedom", symbol: "df", hint: "(rows − 1) × (columns − 1).", required: true, min: 1, integer: true },
    p(),
    n(1),
    { key: "cramersV", label: "Cramér's V", symbol: "V", hint: "Optional effect size, between 0 and 1.", required: false, min: 0, max: 1 },
    { key: "smallerSide", label: "Smaller of rows − 1 and columns − 1", symbol: "k", hint: "Optional; 1 for a 2 × 2 table. Used to judge V.", required: false, min: 1, integer: true },
    { key: "minExpected", label: "Smallest expected count", symbol: "E", hint: "Optional; from your software's expected counts.", required: false, min: 0 },
  ],
  "factor-analysis": [
    { key: "kmo", label: "KMO measure", symbol: "KMO", hint: "Between 0 and 1.", required: true, min: 0, max: 1 },
    p(true, "bartlettP", "Bartlett's test p-value"),
    { key: "factors", label: "Number of factors kept", symbol: "factors", hint: "Optional.", required: false, min: 1, integer: true },
    { key: "variance", label: "Total variance explained (%)", symbol: "%", hint: "Optional, between 0 and 100.", required: false, min: 0, max: 100 },
    { key: "lowestLoading", label: "Lowest main loading", symbol: "λ", hint: "Optional: the weakest item's loading on its own factor.", required: false, min: -1, max: 1 },
  ],
  sem: [
    { key: "cfi", label: "Comparative fit index", symbol: "CFI", hint: "Between 0 and 1.", required: true, min: 0, max: 1 },
    { key: "rmsea", label: "Root mean square error of approximation", symbol: "RMSEA", hint: "Zero or more.", required: true, min: 0 },
    { key: "srmr", label: "Standardised root mean square residual", symbol: "SRMR", hint: "Optional. Zero or more.", required: false, min: 0 },
    { key: "tli", label: "Tucker–Lewis index", symbol: "TLI", hint: "Optional. Can slightly exceed 1.", required: false, min: 0 },
    p(false, "chi2P", "p-value of the model chi-square test"),
  ],
  "pls-sem": [
    { key: "path", label: "Path coefficient", symbol: "β", hint: "The standardised path your hypothesis concerns.", required: true, min: -1, max: 1 },
    p(),
    { key: "r2", label: "R squared of the outcome", symbol: "R²", hint: "Optional, between 0 and 1.", required: false, min: 0, max: 1 },
    { key: "ave", label: "Average variance extracted", symbol: "AVE", hint: "Optional, between 0 and 1.", required: false, min: 0, max: 1 },
    { key: "cr", label: "Composite reliability", symbol: "CR", hint: "Optional, between 0 and 1.", required: false, min: 0, max: 1 },
    { key: "htmt", label: "Heterotrait–monotrait ratio", symbol: "HTMT", hint: "Optional; the highest value between two constructs.", required: false, min: 0 },
  ],
};

/** Significance levels the researcher can choose. */
export const SIGNIFICANCE_LEVELS = [0.05, 0.01, 0.1] as const;
export type SignificanceLevel = (typeof SIGNIFICANCE_LEVELS)[number];

export interface ResultInput {
  kind: ResultKind;
  /** The numbers entered, by field key. Missing fields are left out. */
  values: Readonly<Record<string, number>>;
  /** Names of the project variables the result concerns: the predictor or grouping variable first, then the outcome. */
  variables: readonly string[];
  /** The hypothesis the result tests, if any. */
  hypothesisId: string | null;
  alpha: SignificanceLevel;
}

export function getFields(kind: ResultKind): readonly FieldSpec[] {
  const fields = RESULT_FIELDS[kind];
  if (!fields) throw new RangeError(`Unknown result kind: ${kind}`);
  return fields;
}
