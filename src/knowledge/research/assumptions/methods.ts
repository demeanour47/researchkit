/**
 * The assumptions behind each supported analysis, what to use instead when they fail,
 * and how to report the checks. Method names and limitations come from the analysis
 * method catalogue; assumptions are referenced by id from the assumption catalogue, so
 * nothing is defined twice. Reporting examples use illustrative numbers and bracketed
 * placeholders; they are models of wording, not results.
 */

import { NON_PARAMETRIC_ALTERNATIVE, getAnalysisMethod, type AnalysisMethodId } from "../data-analysis-types";
import type { AssumptionId } from "./catalogue";

export const ASSUMPTION_METHODS = [
  "descriptive-statistics",
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
  "repeated-measures-anova",
  "ancova",
  "manova",
  "chi-square",
  "factor-analysis",
  "sem",
  "pls-sem",
] as const satisfies readonly AnalysisMethodId[];
export type AssumptionMethod = (typeof ASSUMPTION_METHODS)[number];

/** An alternative method: one this tool's catalogue covers, by id, or one it doesn't, by name. */
export interface Alternative {
  method: AnalysisMethodId | null;
  name: string;
  /** When to choose it. */
  when: string;
}

export interface MethodGuide {
  method: AssumptionMethod;
  /** The assumptions to check, in the order researchers usually check them. */
  assumptions: readonly AssumptionId[];
  /** Other ways to analyse the data when assumptions fail, such as corrections or robust versions. */
  alternatives: readonly Alternative[];
  /** Non-parametric methods that answer the same question without assuming normality. */
  nonParametric: readonly Alternative[];
  /** How the assumption checks are commonly reported. Illustrative numbers only. */
  reporting: string;
  mistakes: readonly string[];
}

const other = (name: string, when: string): Alternative => ({ method: null, name, when });
const covered = (method: AnalysisMethodId, when: string): Alternative => ({ method, name: getAnalysisMethod(method).name, when });
/** The catalogue's own non-parametric counterpart, so the pairing is defined once. */
const counterpart = (method: AnalysisMethodId, when: string): Alternative[] => {
  const alternative = NON_PARAMETRIC_ALTERNATIVE[method];
  return alternative ? [covered(alternative, when)] : [];
};

const REGRESSION_ASSUMPTIONS: readonly AssumptionId[] = ["numeric-measurement", "independence", "linearity", "normality-of-residuals", "homoscedasticity", "independent-errors", "outliers"];
const REGRESSION_ALTERNATIVES: readonly Alternative[] = [
  other("Robust (heteroscedasticity-consistent) standard errors", "When the residuals' spread is unequal."),
  other("Bootstrapped confidence intervals", "When the residuals aren't normal, especially in smaller samples."),
  other("Transforming the outcome", "When the outcome is strongly skewed or the relationship is curved."),
];
const REGRESSION_MISTAKES = [
  "Checking the normality of each variable instead of the residuals.",
  "Skipping the residual plots, which reveal non-linearity and unequal spread together.",
  "Deleting outliers without a reason other than their size, and without reporting it.",
];

export const METHOD_GUIDES: Readonly<Record<AssumptionMethod, MethodGuide>> = {
  "descriptive-statistics": {
    method: "descriptive-statistics",
    assumptions: ["distribution-shape", "outliers"],
    alternatives: [],
    nonParametric: [covered("median", "When a numeric variable is skewed, or a variable is ordinal: report the median and interquartile range.")],
    reporting: "Example: [Variable] was positively skewed (skewness = 1.84), so the median and interquartile range are reported (Mdn = 12, IQR = 8–19).",
    mistakes: ["Reporting means for single rating items or skewed variables without comment.", "Not checking the data for entry errors, such as impossible values, before summarising."],
  },
  correlation: {
    method: "correlation",
    assumptions: ["numeric-measurement", "independence", "linearity", "normality", "outliers"],
    alternatives: [other("Kendall's tau-b", "When there are many tied ranks or the sample is small.")],
    nonParametric: counterpart("pearson", "When a variable is ordinal, the relationship is monotonic but curved, or the data aren't normal."),
    reporting: "Example: Scatterplots showed a linear relationship with no extreme outliers, and both variables were approximately normal (skewness and kurtosis within ±1), so Pearson's correlation was used.",
    mistakes: ["Calculating a correlation without looking at the scatterplot.", "Choosing between Pearson and Spearman after seeing which gives the significant result."],
  },
  pearson: {
    method: "pearson",
    assumptions: ["numeric-measurement", "independence", "linearity", "normality", "outliers"],
    alternatives: [other("Kendall's tau-b", "When there are many tied ranks or the sample is small.")],
    nonParametric: counterpart("pearson", "When a variable is ordinal, the relationship is monotonic but curved, or the data aren't normal."),
    reporting: "Example: Scatterplots showed a linear relationship with no extreme outliers, and both variables were approximately normal (Shapiro–Wilk p = .21 and p = .34).",
    mistakes: ["Calculating Pearson's r without looking at the scatterplot.", "Ignoring a single outlier that creates, or hides, the correlation."],
  },
  spearman: {
    method: "spearman",
    assumptions: ["ordinal-measurement", "independence", "monotonicity"],
    alternatives: [other("Kendall's tau-b", "When there are many tied ranks or the sample is small.")],
    nonParametric: [],
    reporting: "Example: Because [variable] was measured on an ordinal scale, Spearman's rank correlation was used; a scatterplot showed a monotonic relationship.",
    mistakes: ["Assuming Spearman needs no checks at all: it still assumes independent observations and a monotonic relationship."],
  },
  "simple-regression": {
    method: "simple-regression",
    assumptions: REGRESSION_ASSUMPTIONS,
    alternatives: REGRESSION_ALTERNATIVES,
    nonParametric: [covered("spearman", "When only the strength of a monotonic relationship is needed, not a prediction equation.")],
    reporting: "Example: The residual plot showed no pattern, the P–P plot showed approximately normal residuals, no standardised residual exceeded ±3, and the Durbin–Watson statistic was 1.94.",
    mistakes: REGRESSION_MISTAKES,
  },
  "multiple-regression": {
    method: "multiple-regression",
    assumptions: [...REGRESSION_ASSUMPTIONS, "multicollinearity"],
    alternatives: REGRESSION_ALTERNATIVES,
    nonParametric: [],
    reporting: "Example: VIF values ranged from 1.12 to 2.35, below the common threshold of 10; the residual plots showed no pattern, the residuals were approximately normal, and the Durbin–Watson statistic was 1.87.",
    mistakes: [...REGRESSION_MISTAKES, "Reporting coefficients without checking multicollinearity first."],
  },
  "hierarchical-regression": {
    method: "hierarchical-regression",
    assumptions: [...REGRESSION_ASSUMPTIONS, "multicollinearity"],
    alternatives: REGRESSION_ALTERNATIVES,
    nonParametric: [],
    reporting: "Example: Assumptions were checked on the final model: VIF values were below 3, the residuals were approximately normal and evenly spread, and no case had a Cook's distance above 1.",
    mistakes: [...REGRESSION_MISTAKES, "Checking assumptions only for the first step, when the final model is the one interpreted."],
  },
  "logistic-regression": {
    method: "logistic-regression",
    assumptions: ["binary-outcome", "independence", "linearity-of-logit", "multicollinearity", "events-per-predictor", "outliers"],
    alternatives: [other("Penalised (Firth) logistic regression", "When events are few or a predictor perfectly separates the outcomes."), other("Multinomial or ordinal logistic regression", "When the outcome has more than two categories.")],
    nonParametric: [covered("chi-square", "When the predictors are categorical and only an association is needed.")],
    reporting: "Example: The Box–Tidwell procedure showed a linear relationship between each numeric predictor and the logit (all p > .05), VIF values were below 2, and the smaller outcome group had 14 cases per predictor.",
    mistakes: ["Testing normality, which logistic regression doesn't assume.", "Using many predictors with few cases in the smaller outcome group."],
  },
  "independent-t-test": {
    method: "independent-t-test",
    assumptions: ["numeric-measurement", "independence", "normality", "homogeneity-of-variance", "outliers"],
    alternatives: [other("Welch's t-test", "When the groups' variances differ; many recommend it by default.")],
    nonParametric: counterpart("independent-t-test", "When the outcome is ordinal, or not normal in small groups."),
    reporting: "Example: [Outcome] was approximately normal in both groups (Shapiro–Wilk p = .21 and p = .34), and Levene's test indicated equal variances, F(1, 118) = 0.92, p = .339.",
    mistakes: ["Checking normality for the whole sample instead of within each group.", "Ignoring Levene's test, or not saying which version of the t-test was used."],
  },
  "paired-t-test": {
    method: "paired-t-test",
    assumptions: ["numeric-measurement", "paired-observations", "normality-of-differences", "outliers"],
    alternatives: [other("Bootstrapped confidence interval for the mean difference", "When the differences aren't normal but a mean difference is still wanted.")],
    nonParametric: counterpart("paired-t-test", "When the differences aren't normal, or the outcome is ordinal."),
    reporting: "Example: The differences between the two measurements were approximately normal (Shapiro–Wilk p = .48), with no outliers beyond ±3 standard deviations.",
    mistakes: ["Checking normality of each time point instead of the differences.", "Using it for two separate groups."],
  },
  "one-way-anova": {
    method: "one-way-anova",
    assumptions: ["numeric-measurement", "independence", "normality", "homogeneity-of-variance", "outliers", "group-sizes"],
    alternatives: [other("Welch's ANOVA with Games–Howell post hoc tests", "When the groups' variances differ.")],
    nonParametric: counterpart("one-way-anova", "When the outcome is ordinal, or not normal in small groups."),
    reporting: "Example: [Outcome] was approximately normal in each group, and Levene's test indicated equal variances, F(2, 117) = 1.08, p = .343.",
    mistakes: ["Checking normality for the whole sample instead of within each group.", "Using standard post hoc tests after finding unequal variances."],
  },
  "two-way-anova": {
    method: "two-way-anova",
    assumptions: ["numeric-measurement", "independence", "normality", "homogeneity-of-variance", "outliers", "group-sizes"],
    alternatives: [other("Robust or bootstrapped ANOVA", "When normality or equal variances clearly fail."), other("Transforming the outcome", "When the outcome is strongly skewed.")],
    nonParametric: [other("Aligned rank transform ANOVA", "When the outcome is ordinal or not normal and the interaction must still be tested.")],
    reporting: "Example: Levene's test indicated equal variances across the six cells, F(5, 114) = 1.21, p = .308, and residuals were approximately normal.",
    mistakes: ["Checking assumptions for each factor separately instead of for every cell.", "Ignoring very unequal cell sizes."],
  },
  "repeated-measures-anova": {
    method: "repeated-measures-anova",
    assumptions: ["numeric-measurement", "paired-observations", "normality", "sphericity", "outliers"],
    alternatives: [other("Greenhouse–Geisser or Huynh–Feldt correction", "When sphericity fails."), other("Linear mixed model", "When some participants miss a time point, or times are unevenly spaced.")],
    nonParametric: [other("Friedman test", "When the outcome is ordinal, or not normal with few participants.")],
    reporting: "Example: Mauchly's test indicated that sphericity was violated, χ²(2) = 8.41, p = .015, so the Greenhouse–Geisser correction was applied (ε = .68).",
    mistakes: ["Reporting uncorrected F after Mauchly's test is significant.", "Dropping participants with any missing time point without saying so."],
  },
  ancova: {
    method: "ancova",
    assumptions: ["numeric-measurement", "independence", "normality-of-residuals", "homogeneity-of-variance", "linearity", "homogeneity-of-slopes", "covariate-independence", "outliers"],
    alternatives: [other("Regression with a group × covariate interaction", "When the regression slopes differ between groups.")],
    nonParametric: [other("Quade's rank analysis of covariance", "When the outcome is ordinal or clearly not normal.")],
    reporting: "Example: The group × covariate interaction was not significant, F(1, 116) = 0.74, p = .391, indicating homogeneous regression slopes, and the covariate was linearly related to the outcome in each group.",
    mistakes: ["Skipping the test of homogeneous slopes.", "Adjusting for a covariate measured after the intervention."],
  },
  manova: {
    method: "manova",
    assumptions: ["numeric-measurement", "independence", "multivariate-normality", "homogeneity-of-covariance", "related-outcomes", "multivariate-outliers", "group-sizes"],
    alternatives: [other("Pillai's trace", "When assumptions are doubtful or groups are unequal; it is the most robust multivariate statistic."), other("Separate ANOVAs with a corrected significance level", "When the outcomes are unrelated.")],
    nonParametric: [other("Permutation MANOVA (PERMANOVA)", "When multivariate normality clearly fails.")],
    reporting: "Example: Box's M test was not significant at the .001 level, M = 18.42, p = .042, and no multivariate outliers were found using Mahalanobis distance (p < .001 criterion).",
    mistakes: ["Treating Box's M as failed at p below .05, when .001 is the usual level.", "Including outcomes that are unrelated or nearly identical."],
  },
  "chi-square": {
    method: "chi-square",
    assumptions: ["categorical-variables", "independence", "expected-counts"],
    alternatives: [other("Combining sparse categories", "When some categories have very few cases and theory allows merging them.")],
    nonParametric: [covered("fisher-exact", "When expected counts are too small for chi-square.")],
    reporting: "Example: All expected counts were 5 or more, so the chi-square test of independence was used.",
    mistakes: ["Counting the same participant in more than one cell.", "Not checking the expected counts, which your software reports."],
  },
  "factor-analysis": {
    method: "factor-analysis",
    assumptions: ["factorability", "factor-sample-size", "linearity", "outliers"],
    alternatives: [other("Principal axis factoring", "When the items aren't normal enough for maximum likelihood extraction."), other("Factor analysis of polychoric correlations", "When the items are ordinal, such as single rating items with few points.")],
    nonParametric: [],
    reporting: "Example: The Kaiser–Meyer–Olkin measure was .84, and Bartlett's test of sphericity was significant, χ²(66) = 812.45, p < .001, indicating the data were suitable for factor analysis.",
    mistakes: ["Skipping KMO and Bartlett's test.", "Running factor analysis on too few participants for the number of items."],
  },
  sem: {
    method: "sem",
    assumptions: ["numeric-measurement", "independence", "multivariate-normality", "multivariate-outliers", "model-identification", "sem-sample-size", "measurement-model-quality", "discriminant-validity"],
    alternatives: [other("Robust maximum likelihood (Satorra–Bentler)", "When multivariate normality fails."), other("Weighted least squares estimation (such as WLSMV)", "When indicators are ordinal, such as rating items with few points.")],
    nonParametric: [covered("pls-sem", "When distributional assumptions or sample size are a concern and the aim is prediction.")],
    reporting: "Example: Mardia's normalised multivariate kurtosis was 3.2, below the common threshold of 5, so maximum likelihood estimation was used; all standardised loadings exceeded .70.",
    mistakes: ["Assessing the structural model before confirming the measurement model.", "Using maximum likelihood with clearly non-normal or ordinal indicators without correction."],
  },
  "pls-sem": {
    method: "pls-sem",
    assumptions: ["independence", "measurement-model-quality", "discriminant-validity", "structural-collinearity", "sem-sample-size"],
    alternatives: [covered("cb-sem", "When the aim is confirming an established theory and its assumptions and sample size are met.")],
    nonParametric: [],
    reporting: "Example: All indicator loadings exceeded .708, composite reliability ranged from .82 to .91, AVE exceeded .50, HTMT values were below .85, and structural VIF values were below 3.",
    mistakes: ["Skipping the measurement model assessment before interpreting paths.", "Believing PLS-SEM has no assumptions: independence and an adequate sample still matter."],
  },
};

export function getMethodGuide(method: AssumptionMethod): MethodGuide {
  const guide = METHOD_GUIDES[method];
  if (!guide) throw new RangeError(`No assumption guide for: ${method}`);
  return guide;
}

export const isAssumptionMethod = (method: string): method is AssumptionMethod => (ASSUMPTION_METHODS as readonly string[]).includes(method);
