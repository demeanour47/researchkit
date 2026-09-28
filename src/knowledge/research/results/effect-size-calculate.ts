import { chiSquareTest, logGamma } from "../../tables/stats";

/**
 * Independent-group d and Hedges' small-sample correction follow the sources
 * cohen-1988 and hedges-1981; paired d_z and d_av follow distinct definitions in
 * lakens-2013. Eta, partial eta, phi, Cramér's V and adjusted R² use
 * their named sum-of-squares, table-shape or regression definitions; no magnitude
 * classifier or significance test is applied here.
 */

export const EFFECT_SIZE_METHOD_IDS = [
  "cohens-d-independent",
  "hedges-g-independent",
  "cohens-d-paired-dz",
  "cohens-d-paired-dav",
  "correlation-r-squared",
  "eta-squared",
  "partial-eta-squared",
  "phi",
  "cramers-v",
  "r-squared",
  "adjusted-r-squared",
] as const;
export type EffectSizeMethodId = (typeof EFFECT_SIZE_METHOD_IDS)[number];

export type EffectSizeInput =
  | { method: "cohens-d-independent" | "hedges-g-independent"; mean1: number; sd1: number; n1: number; mean2: number; sd2: number; n2: number }
  | { method: "cohens-d-paired-dz"; meanDifference: number; sdDifferences: number; nPairs: number }
  | { method: "cohens-d-paired-dav"; meanDifference: number; sd1: number; sd2: number; nPairs: number }
  | { method: "correlation-r-squared"; r: number }
  | { method: "eta-squared"; ssEffect: number; ssTotal: number }
  | { method: "partial-eta-squared"; ssEffect: number; ssError: number }
  | { method: "phi" | "cramers-v"; observed: readonly (readonly number[])[] }
  | { method: "r-squared"; rSquared: number }
  | { method: "adjusted-r-squared"; rSquared: number; sampleSize: number; predictors: number };

export interface EffectSizeField {
  key: string;
  label: string;
  hint: string;
  required: boolean;
  kind?: "number" | "counts";
  min?: number;
  max?: number;
  integer?: boolean;
}

export interface EffectSizeMethod {
  id: EffectSizeMethodId;
  name: string;
  description: string;
  formula: string;
  fields: readonly EffectSizeField[];
}

const numberField = (key: string, label: string, hint: string, min?: number, max?: number, integer = false): EffectSizeField => ({ key, label, hint, required: true, min, max, integer });

export const EFFECT_SIZE_METHODS: readonly EffectSizeMethod[] = [
  { id: "cohens-d-independent", name: "Cohen's d (independent groups)", description: "Standardizes a mean difference between two independent groups by their pooled sample standard deviation.", formula: "d = (M₁ − M₂) ÷ s_p", fields: [numberField("mean1", "Group 1 mean", "Sample mean for the first independent group."), numberField("sd1", "Group 1 SD", "Sample standard deviation; must be above 0.", 0), numberField("n1", "Group 1 sample size", "Number of independent observations; at least 2.", 2, undefined, true), numberField("mean2", "Group 2 mean", "Sample mean for the second independent group."), numberField("sd2", "Group 2 SD", "Sample standard deviation; must be above 0.", 0), numberField("n2", "Group 2 sample size", "Number of independent observations; at least 2.", 2, undefined, true)] },
  { id: "hedges-g-independent", name: "Hedges' g (independent groups)", description: "Applies a small-sample correction to the pooled-SD independent-groups standardized mean difference.", formula: "g = J(df) × [(M₁ − M₂) ÷ s_p]", fields: [numberField("mean1", "Group 1 mean", "Sample mean for the first independent group."), numberField("sd1", "Group 1 SD", "Sample standard deviation; must be above 0.", 0), numberField("n1", "Group 1 sample size", "Number of independent observations; at least 2.", 2, undefined, true), numberField("mean2", "Group 2 mean", "Sample mean for the second independent group."), numberField("sd2", "Group 2 SD", "Sample standard deviation; must be above 0.", 0), numberField("n2", "Group 2 sample size", "Number of independent observations; at least 2.", 2, undefined, true)] },
  { id: "cohens-d-paired-dz", name: "Paired standardized difference (d_z)", description: "Standardizes the mean of paired differences by the SD of those differences.", formula: "d_z = M_d ÷ s_d", fields: [numberField("meanDifference", "Mean paired difference", "Mean of the within-pair differences."), numberField("sdDifferences", "SD of paired differences", "Sample SD of the within-pair differences; must be above 0.", 0), numberField("nPairs", "Complete pairs", "Number of pairs with both measurements; at least 2.", 2, undefined, true)] },
  { id: "cohens-d-paired-dav", name: "Paired standardized difference (d_av)", description: "Standardizes the mean paired difference by the average of the two marginal variances.", formula: "d_av = M_d ÷ √[(s₁² + s₂²) ÷ 2]", fields: [numberField("meanDifference", "Mean paired difference", "Mean of the within-pair differences."), numberField("sd1", "First measurement SD", "Sample SD at the first time or condition."), numberField("sd2", "Second measurement SD", "Sample SD at the second time or condition."), numberField("nPairs", "Complete pairs", "Number of pairs with both measurements; at least 2.", 2, undefined, true)] },
  { id: "correlation-r-squared", name: "Correlation and r²", description: "Shows a correlation coefficient and its square; r² is a descriptive shared-variation quantity, not a causal effect.", formula: "r² = r × r", fields: [numberField("r", "Pearson correlation r", "The Pearson correlation coefficient, from −1 to 1.", -1, 1)] },
  { id: "eta-squared", name: "Eta squared (η²)", description: "The share of total sum of squares associated with a specified effect in the model.", formula: "η² = SS_effect ÷ SS_total", fields: [numberField("ssEffect", "Effect sum of squares", "SS for the effect of interest; 0 or more.", 0), numberField("ssTotal", "Total sum of squares", "Total SS from the same model; must be greater than effect SS.", 0)] },
  { id: "partial-eta-squared", name: "Partial eta squared (ηp²)", description: "The share of effect plus error variation associated with an effect, holding other model effects aside.", formula: "ηp² = SS_effect ÷ (SS_effect + SS_error)", fields: [numberField("ssEffect", "Effect sum of squares", "SS for the effect of interest; 0 or more.", 0), numberField("ssError", "Error sum of squares", "Corresponding error SS from the same model; 0 or more.", 0)] },
  { id: "phi", name: "Phi (2 × 2 table)", description: "A chi-square-based association magnitude for a 2 × 2 contingency table only.", formula: "φ = √(χ² ÷ N)", fields: [{ key: "observed", label: "Observed counts", hint: "Enter rows separated by semicolons, with comma-separated counts (for example: 20,10; 10,20). Use counts, not percentages.", required: true, kind: "counts" }] },
  { id: "cramers-v", name: "Cramér's V", description: "A chi-square-based association magnitude for 2 × 2 or larger contingency tables.", formula: "V = √[χ² ÷ (N × min(rows − 1, columns − 1))]", fields: [{ key: "observed", label: "Observed counts", hint: "Enter rows separated by semicolons, with comma-separated counts (for example: 20,10; 10,20). Use counts, not percentages.", required: true, kind: "counts" }] },
  { id: "r-squared", name: "R squared", description: "Reports the model's proportion of outcome variance accounted for by its fitted values.", formula: "R² as reported by the model", fields: [numberField("rSquared", "R squared", "From Model Summary; between 0 and 1.", 0, 1)] },
  { id: "adjusted-r-squared", name: "Adjusted R squared", description: "Calculates the regression R² adjustment for sample size and number of predictors.", formula: "Adjusted R² = 1 − [(1 − R²)(N − 1) ÷ (N − k − 1)]", fields: [numberField("rSquared", "R squared", "From Model Summary; between 0 and 1.", 0, 1), numberField("sampleSize", "Sample size N", "Analysis cases used to fit the model; whole number.", 2, undefined, true), numberField("predictors", "Predictor count k", "Number of fitted predictors, excluding the intercept; whole number.", 1, undefined, true)] },
];

export function getEffectSizeMethod(id: EffectSizeMethodId): EffectSizeMethod {
  const method = EFFECT_SIZE_METHODS.find((entry) => entry.id === id);
  if (!method) throw new RangeError(`Unknown effect-size method: ${id}`);
  return method;
}

export interface CalculationStep {
  label: string;
  formula: string;
  substitution: string;
  value: number;
}

export type EffectSizeCalculation =
  | { status: "complete"; method: EffectSizeMethodId; formula: string; steps: readonly CalculationStep[]; value: number; outputs: readonly { label: string; value: number }[]; note: string }
  | { status: "invalid"; method: EffectSizeMethodId; problems: readonly string[] };

/** Reads an incomplete form draft at the boundary and validates it before calculation. */
export function calculateEffectSizeFromText(method: EffectSizeMethodId, values: Readonly<Record<string, string>>): EffectSizeCalculation {
  const definition = getEffectSizeMethod(method);
  const problems: string[] = [];
  const parsed: Record<string, number> = {};
  let observed: number[][] | undefined;

  for (const field of definition.fields) {
    const raw = values[field.key]?.trim() ?? "";
    if (raw.length === 0) {
      if (field.required) problems.push(`Enter ${field.label.toLowerCase()}.`);
      continue;
    }
    if (field.kind === "counts") {
      const result = parseObservedCounts(raw);
      if (!result.ok) problems.push(result.problem);
      else observed = result.value;
      continue;
    }
    const normalized = raw.replace(/[−–]/g, "-").trim();
    const numeric = /^[+-]?(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
    if (!numeric.test(normalized)) {
      problems.push(`${field.label} must be a finite number; use commas only as thousands separators.`);
      continue;
    }
    const value = Number(normalized.replaceAll(",", ""));
    if (!Number.isFinite(value)) {
      problems.push(`${field.label} must be a finite number.`);
      continue;
    }
    if (field.integer && !Number.isInteger(value)) problems.push(`${field.label} must be a whole number.`);
    else if (field.min !== undefined && value < field.min) problems.push(`${field.label} must be at least ${field.min}.`);
    else if (field.max !== undefined && value > field.max) problems.push(`${field.label} cannot be more than ${field.max}.`);
    else parsed[field.key] = value;
  }
  if (problems.length > 0) return invalid(method, ...problems);

  switch (method) {
    case "cohens-d-independent":
    case "hedges-g-independent":
      return calculateEffectSize({ method, mean1: parsed.mean1, sd1: parsed.sd1, n1: parsed.n1, mean2: parsed.mean2, sd2: parsed.sd2, n2: parsed.n2 });
    case "cohens-d-paired-dz":
      return calculateEffectSize({ method, meanDifference: parsed.meanDifference, sdDifferences: parsed.sdDifferences, nPairs: parsed.nPairs });
    case "cohens-d-paired-dav":
      return calculateEffectSize({ method, meanDifference: parsed.meanDifference, sd1: parsed.sd1, sd2: parsed.sd2, nPairs: parsed.nPairs });
    case "correlation-r-squared":
      return calculateEffectSize({ method, r: parsed.r });
    case "eta-squared":
      return calculateEffectSize({ method, ssEffect: parsed.ssEffect, ssTotal: parsed.ssTotal });
    case "partial-eta-squared":
      return calculateEffectSize({ method, ssEffect: parsed.ssEffect, ssError: parsed.ssError });
    case "phi":
    case "cramers-v":
      return calculateEffectSize({ method, observed: observed ?? [] });
    case "r-squared":
      return calculateEffectSize({ method, rSquared: parsed.rSquared });
    case "adjusted-r-squared":
      return calculateEffectSize({ method, rSquared: parsed.rSquared, sampleSize: parsed.sampleSize, predictors: parsed.predictors });
  }
}

function parseObservedCounts(text: string): { ok: true; value: number[][] } | { ok: false; problem: string } {
  const rows = text.split(";").map((row) => row.split(",").map((cell) => cell.trim()));
  if (rows.some((row) => row.some((cell) => cell.length === 0))) return { ok: false, problem: "Enter observed counts as nonempty rows separated by semicolons and cells separated by commas." };
  const values = rows.map((row) => row.map(Number));
  if (values.some((row) => row.some((value) => !Number.isFinite(value)))) return { ok: false, problem: "Every observed cell count must be a finite number." };
  const tableProblems = validateCounts(values);
  return tableProblems.length > 0 ? { ok: false, problem: tableProblems[0] } : { ok: true, value: values };
}

const invalid = (method: EffectSizeMethodId, ...problems: string[]): EffectSizeCalculation => ({ status: "invalid", method, problems });
const complete = (method: EffectSizeMethodId, formula: string, steps: CalculationStep[], value: number, note: string, outputs: readonly { label: string; value: number }[] = [{ label: "Effect size", value }]): EffectSizeCalculation => ({ status: "complete", method, formula, steps, value, outputs, note });
const finite = (...values: number[]) => values.every(Number.isFinite);
const nonnegative = (...values: number[]) => values.every((value) => value >= 0);
const count = (value: number) => Number.isInteger(value) && value >= 2;
const shown = (value: number) => Number(value.toPrecision(12));

/** Exact normal-theory small-sample correction, evaluated in log space. */
function hedgesCorrection(df: number): number {
  return Math.exp(logGamma(df / 2) - 0.5 * Math.log(df / 2) - logGamma((df - 1) / 2));
}

function independent(input: Extract<EffectSizeInput, { method: "cohens-d-independent" | "hedges-g-independent" }>): EffectSizeCalculation {
  const { method, mean1, mean2, sd1, sd2, n1, n2 } = input;
  if (!finite(mean1, mean2, sd1, sd2, n1, n2)) return invalid(method, "Enter finite values for both means, standard deviations and sample sizes.");
  if (!nonnegative(sd1, sd2)) return invalid(method, "Standard deviations cannot be negative.");
  if (!count(n1) || !count(n2)) return invalid(method, "Each independent group needs at least two observations to estimate a sample standard deviation.");
  const df = n1 + n2 - 2;
  const pooled = Math.sqrt(((n1 - 1) * sd1 ** 2 + (n2 - 1) * sd2 ** 2) / df);
  if (!(pooled > 0)) return invalid(method, "The pooled standard deviation must be greater than 0 because a standardized mean difference divides by it.");
  const difference = mean1 - mean2;
  const d = difference / pooled;
  const steps: CalculationStep[] = [
    { label: "Pooled standard deviation", formula: "s_p = √[((n₁ − 1)s₁² + (n₂ − 1)s₂²) ÷ (n₁ + n₂ − 2)]", substitution: `√[((${n1} − 1) × ${sd1}² + (${n2} − 1) × ${sd2}²) ÷ ${df}] = ${shown(pooled)}`, value: pooled },
    { label: "Mean difference", formula: "M₁ − M₂", substitution: `${mean1} − ${mean2} = ${shown(difference)}`, value: difference },
    { label: "Cohen's d", formula: "d = (M₁ − M₂) ÷ s_p", substitution: `${shown(difference)} ÷ ${shown(pooled)} = ${shown(d)}`, value: d },
  ];
  if (method === "cohens-d-independent") return complete(method, "d = (M₁ − M₂) ÷ s_p", steps, d, "This pooled-SD version assumes the groups are independent. Magnitude alone does not determine practical importance or statistical significance.");
  const correction = hedgesCorrection(df);
  const g = correction * d;
  steps.push({ label: "Small-sample correction J", formula: "J(df) = Γ(df ÷ 2) ÷ [√(df ÷ 2) × Γ((df − 1) ÷ 2)]", substitution: `J(${df}) = ${shown(correction)}`, value: correction });
  steps.push({ label: "Hedges' g", formula: "g = J(df) × d", substitution: `${shown(correction)} × ${shown(d)} = ${shown(g)}`, value: g });
  return complete(method, "g = J(df) × [(M₁ − M₂) ÷ s_p]", steps, g, "Hedges' g applies a small-sample correction to the pooled-SD standardized mean difference. It does not determine statistical significance.");
}

export function calculateEffectSize(input: EffectSizeInput): EffectSizeCalculation {
  switch (input.method) {
    case "cohens-d-independent":
    case "hedges-g-independent":
      return independent(input);
    case "cohens-d-paired-dz": {
      if (!finite(input.meanDifference, input.sdDifferences, input.nPairs)) return invalid(input.method, "Enter finite values for the mean difference, standard deviation of differences and number of pairs.");
      if (input.sdDifferences < 0) return invalid(input.method, "The standard deviation of differences cannot be negative.");
      if (!count(input.nPairs)) return invalid(input.method, "A paired effect size needs at least two complete pairs.");
      if (!(input.sdDifferences > 0)) return invalid(input.method, "The standard deviation of differences must be greater than 0 because d_z divides by it.");
      const value = input.meanDifference / input.sdDifferences;
      return complete(input.method, "d_z = mean difference ÷ SD of differences", [{ label: "Paired standardized mean difference d_z", formula: "d_z = M_d ÷ s_d", substitution: `${input.meanDifference} ÷ ${input.sdDifferences} = ${shown(value)}`, value }], value, "This paired-samples convention standardizes by the SD of within-pair differences. Other paired standardizers answer a different question.");
    }
    case "cohens-d-paired-dav": {
      if (!finite(input.meanDifference, input.sd1, input.sd2, input.nPairs)) return invalid(input.method, "Enter finite values for the mean difference, both standard deviations and number of pairs.");
      if (!nonnegative(input.sd1, input.sd2)) return invalid(input.method, "Standard deviations cannot be negative.");
      if (!count(input.nPairs)) return invalid(input.method, "A paired effect size needs at least two complete pairs.");
      const denominator = Math.sqrt((input.sd1 ** 2 + input.sd2 ** 2) / 2);
      if (!(denominator > 0)) return invalid(input.method, "The average marginal standard deviation must be greater than 0 to standardize the mean difference.");
      const value = input.meanDifference / denominator;
      return complete(input.method, "d_av = mean difference ÷ √[(s₁² + s₂²) ÷ 2]", [
        { label: "Average marginal SD", formula: "s_av = √[(s₁² + s₂²) ÷ 2]", substitution: `√[(${input.sd1}² + ${input.sd2}²) ÷ 2] = ${shown(denominator)}`, value: denominator },
        { label: "Paired standardized mean difference d_av", formula: "d_av = M_d ÷ s_av", substitution: `${input.meanDifference} ÷ ${shown(denominator)} = ${shown(value)}`, value },
      ], value, "This paired-samples convention uses the average of the two marginal variances. It differs from d_z, which uses the SD of paired differences.");
    }
    case "correlation-r-squared": {
      if (!Number.isFinite(input.r) || input.r < -1 || input.r > 1) return invalid(input.method, "A correlation must be between −1 and 1.");
      const value = input.r ** 2;
      return complete(input.method, "r² = r × r", [{ label: "Squared correlation", formula: "r² = r × r", substitution: `${input.r} × ${input.r} = ${shown(value)}`, value }], value, "r² describes shared linear variation for Pearson's correlation. It is not a causal proportion and does not indicate statistical significance.", [{ label: "r", value: input.r }, { label: "r²", value }]);
    }
    case "eta-squared":
    case "partial-eta-squared": {
      const { ssEffect } = input;
      const denominatorInput = input.method === "eta-squared" ? input.ssTotal : input.ssError;
      if (!finite(ssEffect, denominatorInput)) return invalid(input.method, "Enter finite sums of squares.");
      if (!nonnegative(ssEffect, denominatorInput)) return invalid(input.method, "Sums of squares cannot be negative.");
      const denominator = input.method === "eta-squared" ? denominatorInput : ssEffect + denominatorInput;
      if (!(denominator > 0)) return invalid(input.method, "The denominator must be greater than 0; otherwise the proportion of variance is undefined.");
      if (input.method === "eta-squared" && ssEffect > denominatorInput) return invalid(input.method, "Effect sum of squares cannot exceed total sum of squares.");
      const value = ssEffect / denominator;
      const formula = input.method === "eta-squared" ? "η² = SS_effect ÷ SS_total" : "ηp² = SS_effect ÷ (SS_effect + SS_error)";
      return complete(input.method, formula, [{ label: input.method === "eta-squared" ? "Eta squared" : "Partial eta squared", formula, substitution: `${ssEffect} ÷ ${input.method === "eta-squared" ? denominatorInput : `(${ssEffect} + ${denominatorInput})`} = ${shown(value)}`, value }], value, input.method === "eta-squared" ? "Eta squared uses total sum of squares. Report which effect and model it describes." : "Partial eta squared excludes other effects from its denominator. It is not interchangeable with eta squared.");
    }
    case "phi":
    case "cramers-v": {
      const tableProblems = validateCounts(input.observed);
      if (tableProblems.length > 0) return invalid(input.method, ...tableProblems);
      const result = chiSquareTest(input.observed);
      if (!Number.isFinite(result.chi2) || !Number.isFinite(result.n)) return invalid(input.method, "The observed counts do not produce a valid chi-square statistic and total.");
      if (input.method === "phi" && (input.observed.length !== 2 || input.observed[0].length !== 2)) return invalid(input.method, "Phi is supported here only for a 2 × 2 contingency table; use Cramér's V for larger tables.");
      const smallerSide = Math.min(input.observed.length - 1, input.observed[0].length - 1);
      const denominator = result.n * (input.method === "phi" ? 1 : smallerSide);
      const value = Math.sqrt(result.chi2 / denominator);
      const formula = input.method === "phi" ? "φ = √(χ² ÷ N)" : "V = √[χ² ÷ (N × min(rows − 1, columns − 1))]";
      return complete(input.method, formula, [
        { label: "Pearson chi-square", formula: "χ² = Σ[(O − E)² ÷ E]", substitution: `χ² = ${shown(result.chi2)}`, value: result.chi2 },
        { label: "Effect size", formula, substitution: input.method === "phi" ? `√(${shown(result.chi2)} ÷ ${result.n}) = ${shown(value)}` : `√[${shown(result.chi2)} ÷ (${result.n} × ${smallerSide})] = ${shown(value)}`, value },
      ], value, input.method === "phi" ? "Phi is computed only for 2 × 2 tables. It is nonnegative and does not show the direction of association." : "Cramér's V uses the table dimensions. It describes association strength, not direction or causation.");
    }
    case "r-squared": {
      if (!Number.isFinite(input.rSquared) || input.rSquared < 0 || input.rSquared > 1) return invalid(input.method, "R² must be between 0 and 1.");
      return complete(input.method, "R² = proportion of outcome variance explained by the fitted model", [{ label: "R squared", formula: "R²", substitution: `R² = ${shown(input.rSquared)}`, value: input.rSquared }], input.rSquared, "R² describes model fit. It does not establish causation or practical importance.");
    }
    case "adjusted-r-squared": {
      if (!finite(input.rSquared, input.sampleSize, input.predictors)) return invalid(input.method, "Enter finite values for R², sample size and predictor count.");
      if (input.rSquared < 0 || input.rSquared > 1) return invalid(input.method, "R² must be between 0 and 1.");
      if (!Number.isInteger(input.sampleSize) || input.sampleSize < 2) return invalid(input.method, "Sample size must be a whole number of at least 2.");
      if (!Number.isInteger(input.predictors) || input.predictors < 1) return invalid(input.method, "The number of predictors must be a whole number of at least 1.");
      if (input.sampleSize <= input.predictors + 1) return invalid(input.method, "Sample size must exceed the predictor count by at least 2 so residual degrees of freedom are positive.");
      const value = 1 - ((1 - input.rSquared) * (input.sampleSize - 1)) / (input.sampleSize - input.predictors - 1);
      return complete(input.method, "Adjusted R² = 1 − [(1 − R²)(N − 1) ÷ (N − k − 1)]", [{ label: "Adjusted R squared", formula: "1 − [(1 − R²)(N − 1) ÷ (N − k − 1)]", substitution: `1 − [(1 − ${input.rSquared}) × (${input.sampleSize} − 1) ÷ (${input.sampleSize} − ${input.predictors} − 1)] = ${shown(value)}`, value }], value, "Adjusted R² penalizes model fit for the number of predictors; it can be negative. It is not an effect's practical importance.");
    }
  }
}

function validateCounts(observed: readonly (readonly number[])[]): string[] {
  if (observed.length < 2 || observed[0]?.length < 2) return ["A contingency table needs at least two rows and two columns."];
  const width = observed[0].length;
  if (observed.some((row) => row.length !== width)) return ["Every contingency-table row must have the same number of categories."];
  if (observed.some((row) => row.some((value) => !Number.isFinite(value)))) return ["Every observed cell count must be a finite number."];
  if (observed.some((row) => row.some((value) => !Number.isInteger(value) || value < 0))) return ["Observed cell counts must be whole numbers of 0 or more."];
  if (observed.some((row) => row.every((value) => value === 0))) return ["Every row category must contain at least one case."];
  for (let column = 0; column < width; column++) if (observed.every((row) => row[column] === 0)) return ["Every column category must contain at least one case."];
  if (observed.flat().reduce((total, value) => total + value, 0) === 0) return ["At least one case is required to calculate an association effect size."];
  return [];
}