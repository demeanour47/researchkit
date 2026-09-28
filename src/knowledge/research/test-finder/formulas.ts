/**
 * Formulas worth seeing to understand a test, each in plain text with every symbol
 * defined, as the Sample Size Calculator shows its formulas. They explain what a test
 * compares; software does the arithmetic. Tests check each against the project's own
 * statistics functions and hand calculations.
 */

export const FORMULA_IDS = [
  "mean",
  "standard-deviation",
  "t-ratio",
  "one-sample-t",
  "paired-t",
  "expected-count",
  "chi-square",
  "regression",
  "multiple-regression",
  "f-ratio",
] as const;
export type FormulaId = (typeof FORMULA_IDS)[number];

export interface Formula {
  id: FormulaId;
  name: string;
  /** The formula in plain text, with symbols explained in `symbols`. */
  formula: string;
  symbols: readonly string[];
  /** What the formula says, in words. */
  meaning: string;
}

export const FORMULAS: Readonly<Record<FormulaId, Formula>> = {
  mean: {
    id: "mean",
    name: "Mean",
    formula: "x̄ = Σx ÷ n",
    symbols: ["x̄: the sample mean", "Σx: the sum of all the values", "n: the number of values"],
    meaning: "Add every value and divide by how many there are.",
  },
  "standard-deviation": {
    id: "standard-deviation",
    name: "Sample standard deviation",
    formula: "s = √[ Σ(x − x̄)² ÷ (n − 1) ]",
    symbols: ["s: the sample standard deviation", "x: each value", "x̄: the sample mean", "n: the number of values"],
    meaning: "The typical distance of values from the mean. Dividing by n − 1 rather than n makes it a better estimate of the population's spread.",
  },
  "t-ratio": {
    id: "t-ratio",
    name: "The idea behind every t-test",
    formula: "t = difference ÷ standard error of the difference",
    symbols: ["difference: the difference being tested, such as between two group means", "standard error: how much that difference would vary from sample to sample by chance"],
    meaning: "A t value compares the difference found with the variation expected by chance. The further t is from zero, the less the difference looks like chance alone.",
  },
  "one-sample-t": {
    id: "one-sample-t",
    name: "One-sample t",
    formula: "t = (x̄ − μ₀) ÷ (s ÷ √n),  with n − 1 degrees of freedom",
    symbols: ["x̄: the sample mean", "μ₀: the value the mean is compared with, stated in advance", "s: the sample standard deviation", "n: the number of participants"],
    meaning: "How far the sample mean lies from the stated value, measured in standard errors.",
  },
  "paired-t": {
    id: "paired-t",
    name: "Paired-samples t",
    formula: "t = d̄ ÷ (s_d ÷ √n),  with n − 1 degrees of freedom",
    symbols: ["d̄: the mean of the differences between each participant's two measurements", "s_d: the standard deviation of those differences", "n: the number of pairs"],
    meaning: "A paired t-test is a one-sample t-test on the differences, comparing their mean with zero.",
  },
  "expected-count": {
    id: "expected-count",
    name: "Expected count in a cross-tabulation",
    formula: "E = (row total × column total) ÷ N",
    symbols: ["E: the count expected in a cell if the two variables were unrelated", "N: the total number of participants"],
    meaning: "If the variables were unrelated, each cell would hold its row's share of its column's total.",
  },
  "chi-square": {
    id: "chi-square",
    name: "Chi-square statistic",
    formula: "χ² = Σ (O − E)² ÷ E",
    symbols: ["χ²: the chi-square statistic", "O: the observed count in a cell or category", "E: the expected count in the same cell or category", "Σ: add the result for every cell or category"],
    meaning: "The larger the gaps between observed and expected counts, relative to the expected counts, the larger χ².",
  },
  regression: {
    id: "regression",
    name: "Simple linear regression",
    formula: "Y = β₀ + β₁X + ε",
    symbols: ["Y: the outcome", "X: the predictor", "β₀: the intercept, the predicted outcome when X is zero", "β₁: the slope, the change in the predicted outcome for each one-unit increase in X", "ε: the error, what the line doesn't explain for each participant"],
    meaning: "The outcome is modelled as a straight line in the predictor, plus what the line leaves unexplained.",
  },
  "multiple-regression": {
    id: "multiple-regression",
    name: "Multiple linear regression",
    formula: "Y = β₀ + β₁X₁ + β₂X₂ + … + βₖXₖ + ε",
    symbols: ["Y: the outcome", "X₁ … Xₖ: the k predictors", "β₀: the intercept", "β₁ … βₖ: each predictor's slope, holding the other predictors constant", "ε: the error"],
    meaning: "Each slope estimates a predictor's contribution while the other predictors are held constant.",
  },
  "f-ratio": {
    id: "f-ratio",
    name: "The F ratio in ANOVA",
    formula: "F = variance between groups ÷ variance within groups",
    symbols: [
      "variance between groups (mean square between): how far the group means spread around the overall mean",
      "variance within groups (mean square within): how far participants spread around their own group's mean",
    ],
    meaning: "When the group means differ by much more than participants differ within groups, F is large.",
  },
};

export const getFormula = (id: FormulaId): Formula => FORMULAS[id];
